import React, { Component } from "react";
import gql from "graphql-tag";
import { Query, withApollo } from "react-apollo";
import { compose, graphql } from "react-apollo/index";
import { Table, Input, InputNumber, Popconfirm, Form, notification, Button, Icon, Select } from 'antd';
import 'antd/dist/antd.css';
import logger from "../../util/logger";
import { async } from "q";
import * as consts from "../../util/consts";

const log = logger('VideoParameterTable');

const VIDEO_PARAMETER_QUERY = gql`
    query GetVideoParameter {
			videoParameterses {
        id,
        video {
          id,
          title
        },
        owner1 {
          id,
          email
        },
        owner1_percentage,
        owner2 {
          id,
          email
        },
        owner2_percentage,
        owner3 {
          id,
          email
        },
        owner3_percentage
			}
      artists: users(where: {role_in: [USER_PUBLISHER, MFA]}) {
        id,
        email
      }
    }
`;

const UPDATE_VIDEO_PARAMETER = gql`
    mutation UpdateVideoParameter(
      $id: ID, 
      $owner1_id: ID,
      $owner1_percentage: Int, 
      $owner2_id: ID,
      $owner2_percentage: Int,
      $owner3_id: ID,
      $owner3_percentage: Int
    ) {
        updateVideoParameters(
            where: { id: $id }
            data: {
              owner1: { connect: { id: $owner1_id } }
              owner1_percentage: $owner1_percentage
              owner2: { connect: { id: $owner2_id } }
              owner2_percentage: $owner2_percentage
              owner3: { connect: { id: $owner3_id } }
              owner3_percentage: $owner3_percentage
            }
        ) {
            id
        }
    }
`;

const DISCONNECT_OWNER2 = gql`
    mutation DisconnectOwner2(
      $id: ID
    ) {
        updateVideoParameters(
            where: { id: $id }
            data: {
              owner2: { disconnect: true }
            }
        ) {
            id
        }
    }
`;


const DISCONNECT_OWNER3 = gql`
    mutation DisconnectOwner3(
      $id: ID
    ) {
        updateVideoParameters(
            where: { id: $id }
            data: {
              owner3: { disconnect: true }
            }
        ) {
            id
        }
    }
`;

const stringSorter = (key) => (a, b) => {
  if (key.includes('.')) {
    const keys = key.split('.');
    const key1 = keys[0];
    const key2 = keys[1];
    if (a[key1][key2] < b[key1][key2]) { return -1; }
    if (a[key1][key2] > b[key1][key2]) { return 1; }
  } else {
    if (a[key] < b[key]) { return -1; }
    if (a[key] > b[key]) { return 1; }
  }
  return 0;
}

const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    if (this.props.inputType === 'number') {
      let p = {};
      if (this.props.min != undefined) {
        p = {...p, min: this.props.min};
      }
      if (this.props.max != undefined) {
        p = {...p, max: this.props.max};
      }
      if (this.props.step != undefined) {
        p = {...p, step: this.props.step};
      }
      if (this.props.inputFormat === 'money') {
        return (
          <InputNumber
            {...p}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        );
      } else if (this.props.inputFormat === 'percentage') {
        return (
          <InputNumber
            {...p}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
          />
        );
      } else {
        return <InputNumber {...p} />;
      }
    } else if (this.props.inputType === 'select') {
      return (
        <Select style={{ width: '100%' }}>
          {this.props.allowNone && (
            <Select.Option value={null}>None</Select.Option>
          )}
          {this.props.selectData && this.props.selectData.map(artist => (
            <Select.Option value={artist.id}>{artist.email}</Select.Option>
          ))}
        </Select>
      );
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
      rules,
      record,
      index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: rules ? rules : [
                {
                  required: true,
                  message: `Please Input ${title}!`,
                },
              ],
              initialValue: dataIndex.includes('.') ? (record[dataIndex.split('.')[0]] ? record[dataIndex.split('.')[0]][dataIndex.split('.')[1]] : null) : record[dataIndex],
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

class VideoParameterTableComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      editingKey: '',
      data: [],
      artists: [],
    };
  }

  isEditing = record => record.key === this.state.editingKey;

  cancel = () => {
    this.setState({ editingKey: '' });
  };

  save(form, key) {
    form.validateFields(async (error, row) => {
      if (error) {
        return;
      }
      try {
        // console.log('#########', row, key)
        const result = await this.props.UpdateVideoParameter({
          variables: {
            id: key,
            owner1_id: row.owner1.id ? row.owner1.id : consts.MFA_USER_ID,
            owner1_percentage: parseInt(row.owner1_percentage),
            owner2_id: row.owner2.id ? row.owner2.id : consts.MFA_USER_ID,
            owner2_percentage: parseInt(row.owner2_percentage),
            owner3_id: row.owner3.id ? row.owner3.id : consts.MFA_USER_ID,
            owner3_percentage: parseInt(row.owner3_percentage)
          }
        });
        if (result) {
          const newData = [...this.state.data];
          // console.log('######### state.data', this.state.data)
          const index = newData.findIndex(item => key === item.key);
          if (index > -1) {
            const item = newData[index];
            newData.splice(index, 1, {
              ...item,
              ...row,
            });
            // console.log('######### state.artists', this.state.artists)
            const owner1 = this.state.artists.find(d => d.id == row.owner1.id);
            // console.log('######### owner1', owner1)
            if (owner1) {
              newData.splice(index, 1, {
                ...newData[index],
                owner1,
              });
            }
            if (row.owner2.id) {
              const owner2 = this.state.artists.find(d => d.id == row.owner2.id);
              // console.log('######### owner2', owner2)
              if (owner2) {
                newData.splice(index, 1, {
                  ...newData[index],
                  owner2,
                });
              }
            } else {
              if (await this.props.DisconnectOwner2({
                variables: {
                  id: key
                }
              })) {
                newData.splice(index, 1, {
                  ...newData[index],
                  owner2: null,
                });
              } else {
                notification['error']({
                  message: 'Error!',
                  description: "Failed DisconnectOwner2",
                });
              }
            }
            if (row.owner3.id) {
              const owner3 = this.state.artists.find(d => d.id == row.owner3.id);
              // console.log('######### owner3', owner3)
              if (owner3) {
                newData.splice(index, 1, {
                  ...newData[index],
                  owner3,
                });
              }
            } else {
              if (await this.props.DisconnectOwner3({
                variables: {
                  id: key
                }
              })) {
                newData.splice(index, 1, {
                  ...newData[index],
                  owner3: null,
                });
              } else {
                notification['error']({
                  message: 'Error!',
                  description: "Failed DisconnectOwner3",
                });
              }
            }
            // console.log('######### newData', newData)
            this.setState({ data: newData, editingKey: '' });
          }
          location.reload();
        } else {
          notification['error']({
            message: 'Error!',
            description: "Failed UpdateVideoParameter",
          });
        }
      } catch (ex) {
        notification['error']({
          message: 'Error!',
          description: ex.message,
        });
        return;
      }
    });
  }

  edit(key) {
    this.setState({ editingKey: key });
  }

  async componentDidMount() {
    const { data } = await this.props.client.query({
      query: VIDEO_PARAMETER_QUERY,
      variables: { },
      fetchPolicy: "no-cache",
      errorPolicy: "all"
    });
    this.setState({
      data: data.videoParameterses.map(d => ({...d, key: d.id})),
      artists: data.artists.sort(stringSorter('email'))
    });
  }

  render() {

    const components = {
      body: {
        cell: EditableCell,
      },
    };

    let columns = [
      {
        title: 'Video',
        dataIndex: 'video.title',
        align: 'left',
        width: '25%',
        sorter: stringSorter('video.title'),
      },
      {
        title: 'Owner 1',
        dataIndex: 'owner1.id',
        inputType: 'select',
        selectData: this.state.artists,
        align: 'left',
        width: '15%',
        editable: true,
        sorter: stringSorter('owner1.email'),
        render: (text, record) => (record.owner1 ? `${record.owner1.email}` : 'None')
      },
      {
        title: `Owner 1 Percentage`,
        dataIndex: 'owner1_percentage',
        inputType: 'number',
        inputFormat: 'percentage',
        min: 0,
        max: 100,
        step: 1,
        align: 'center',
        width: '5%',
        editable: true,
        render: (text, record) => (`${text}%`)
      },
      {
        title: `Owner 2`,
        dataIndex: 'owner2.id',
        inputType: 'select',
        selectData: this.state.artists,
        allowNone: true,
        rules: [],
        align: 'center',
        width: '15%',
        editable: true,
        render: (text, record) => (record.owner2 ? `${record.owner2.email}` : 'None')
      },
      {
        title: `Owner 2 Percentage`,
        dataIndex: 'owner2_percentage',
        inputType: 'number',
        inputFormat: 'percentage',
        min: 0,
        max: 100,
        step: 1,
        align: 'center',
        width: '5%',
        editable: true,
        render: (text, record) => (`${text}%`)
      },
      {
        title: `Owner 3`,
        dataIndex: 'owner3.id',
        inputType: 'select',
        selectData: this.state.artists,
        allowNone: true,
        rules: [],
        align: 'center',
        width: '15%',
        editable: true,
        render: (text, record) => (record.owner3 ? `${record.owner3.email}` : 'None')
      },
      {
        title: `Owner 3 Percentage`,
        dataIndex: 'owner3_percentage',
        inputType: 'number',
        inputFormat: 'percentage',
        min: 0,
        max: 100,
        step: 1,
        align: 'center',
        width: '5%',
        editable: true,
        render: (text, record) => (`${text}%`)
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        align: 'center',
        width: '15%',
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = this.isEditing(record);
          return editable ? (
            <span>
              <EditableContext.Consumer>
                {form => (
                  <Button type="primary" style={{ marginRight: 8, marginBottom: 6, height: 26 }} onClick={() => this.save(form, record.key)} ><Icon type="save" />Save</Button>
                )}
              </EditableContext.Consumer>
              <Button style={{ height: 26 }} onClick={() => this.cancel(record.key)}><Icon type="close" />Cancel</Button>
            </span>
          ) : (
            <Button type="primary" style={{ marginRight: 8, height: 26 }} disabled={editingKey !== ''} onClick={() => this.edit(record.key)} ><Icon type="edit" />Edit</Button>
          );
        },
      },
    ];

    columns = columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.inputType ? col.inputType : 'text',
          inputFormat: col.inputFormat,
          rules: col.rules,
          selectData: col.selectData,
          allowNone: col.allowNone,
          min: col.min,
          max: col.max,
          step: col.step,
          dataIndex: col.dataIndex,
          title: col.title,
          editing: this.isEditing(record),
        }),
      };
    });

    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
          components={components}
          bordered
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
          size='small'
        />
      </EditableContext.Provider>
    )
  }
}

const VideoParameterTable = compose(
	graphql(UPDATE_VIDEO_PARAMETER, {
		name: "UpdateVideoParameter",
		options: props => ({
			variables: {
        id: props.id,
        owner1_id: props.owner1_id,
        owner1_percentage: props.owner1_percentage,
        owner2_id: props.owner2_id,
        owner2_percentage: props.owner2_percentage,
        owner3_id: props.owner3_id,
        owner3_percentage: props.owner3_percentage
			},
			onCompleted: (res) => {
				if (res) {
          // location.reload();
          notification['success']({
						message: 'Success!',
						description: "Updated successfuly.",
          });
          return { error: false }
				}
				else {
					notification['error']({
						message: 'Error!',
						description: "Unknown error occured!",
          });
          return { error: true }
				}
			},
			onError: async errors => {
				let errs = JSON.stringify(errors);
				//TODO return error to component
				log.trace(errs);
				if (errors && errors.graphQLErrors && errors.graphQLErrors.length > 0) {
					const errMsg = errors.graphQLErrors.map(e => e.message ? e.message : "").join(" ");
					notification['error']({
						message: 'Error!',
						description: errMsg,
					});
				} else {
					notification['error']({
						message: 'Error!',
						description: "Unknown error occured!",
					});
				}
				return { error: true }
			}
		})
  }),
  graphql(DISCONNECT_OWNER2, {
		name: "DisconnectOwner2",
		options: props => ({
			variables: {
        id: props.id
			},
			onCompleted: (res) => {
				if (res) {
          // location.reload();
          // notification['success']({
					// 	message: 'Success!',
					// 	description: "Updated successfuly.",
          // });
          return { error: false }
				}
				else {
					notification['error']({
						message: 'Error!',
						description: "Unknown error occured!",
          });
          return { error: true }
				}
			},
			onError: async errors => {
				let errs = JSON.stringify(errors);
				//TODO return error to component
				log.trace(errs);
				if (errors && errors.graphQLErrors && errors.graphQLErrors.length > 0) {
					const errMsg = errors.graphQLErrors.map(e => e.message ? e.message : "").join(" ");
					notification['error']({
						message: 'Error!',
						description: errMsg,
					});
				} else {
					notification['error']({
						message: 'Error!',
						description: "Unknown error occured!",
					});
				}
				return { error: true }
			}
		})
  }),
  graphql(DISCONNECT_OWNER3, {
		name: "DisconnectOwner3",
		options: props => ({
			variables: {
        id: props.id
			},
			onCompleted: (res) => {
				if (res) {
          // location.reload();
          // notification['success']({
					// 	message: 'Success!',
					// 	description: "Updated successfuly.",
          // });
          return { error: false }
				}
				else {
					notification['error']({
						message: 'Error!',
						description: "Unknown error occured!",
          });
          return { error: true }
				}
			},
			onError: async errors => {
				let errs = JSON.stringify(errors);
				//TODO return error to component
				log.trace(errs);
				if (errors && errors.graphQLErrors && errors.graphQLErrors.length > 0) {
					const errMsg = errors.graphQLErrors.map(e => e.message ? e.message : "").join(" ");
					notification['error']({
						message: 'Error!',
						description: errMsg,
					});
				} else {
					notification['error']({
						message: 'Error!',
						description: "Unknown error occured!",
					});
				}
				return { error: true }
			}
		})
  }),
  graphql(VIDEO_PARAMETER_QUERY, {
    name: "GetVideoParameter",
    options: props => ({
        variables: {
        },
        fetchPolicy: "no-cache",
        errorPolicy: "all",
        onCompleted: async (result) => {
            return result;
        },
        onError: async (errors) => {
          let errs = JSON.stringify(errors);
          //TODO return error to component
          log.trace(errs);
          if (errors && errors.graphQLErrors && errors.graphQLErrors.length > 0) {
            const errMsg = errors.graphQLErrors.map(e => e.message ? e.message : "").join(" ");
            notification['error']({
              message: 'Error!',
              description: errMsg,
            });
          } else {
            notification['error']({
              message: 'Error!',
              description: "Unknown error occured!",
            });
          }
          return { error: true }
      }
    })
  })
)(VideoParameterTableComp);

export default withApollo(Form.create({name: 'VideoParameterTable'})(VideoParameterTable));