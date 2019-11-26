import React, { Component } from "react";
import gql from "graphql-tag";
import { Query, withApollo } from "react-apollo";
import { compose, graphql } from "react-apollo/index";
import { Table, Input, InputNumber, Popconfirm, Form, notification, Button, Icon, Checkbox } from 'antd';
import 'antd/dist/antd.css';
import logger from "../../util/logger";
import { async } from "q";

const log = logger('VideoTotalParameterTable');

const VIDEO_TOTAL_PARAMETER_QUERY = gql`
    query GetVideoTotalParameters {
			videoTotalParameterses {
        id,
				minutes_watched_multiplier,
        exponent_for_minutes_watched,
        star_rating_multiplier,
        star_rating_on_off
			}
    }
`;

const UPDATE_VIDEO_TOTAL_PARAMETER = gql`
    mutation UpdateVideoTotalParameter(
      $id: ID, 
      $minutes_watched_multiplier: Float, 
      $exponent_for_minutes_watched: Float, 
      $star_rating_multiplier: Float, 
      $star_rating_on_off: Int
    ) {
        updateVideoTotalParameters(
            where: { id: $id }
            data: {
              minutes_watched_multiplier: $minutes_watched_multiplier
              exponent_for_minutes_watched: $exponent_for_minutes_watched
              star_rating_multiplier: $star_rating_multiplier
              star_rating_on_off: $star_rating_on_off
            }
        ) {
            id
        }
    }
`;

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
    }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
      inputType,
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
              rules: [
                {
                  required: true,
                  message: `Please Input ${title}!`,
                },
              ],
              initialValue: record[dataIndex],
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

class VideoTotalParameterTableComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      editingKey: '',
      data: [],
    };
    this.columns = [
      {
        title: 'Unique viewer minutes watched multiplier',
        dataIndex: 'minutes_watched_multiplier',
        inputType: 'number',
        min: 0,
        max: 1,
        step: 0.1,
        align: 'center',
        width: '20%',
        editable: true,
      },
      {
        title: 'Exponent for minutes watched',
        dataIndex: 'exponent_for_minutes_watched',
        inputType: 'number',
        min: 0.3,
        max: 3,
        step: 0.1,
        align: 'center',
        width: '20%',
        editable: true,
      },
      {
        title: 'Star-rating multiplier',
        dataIndex: 'star_rating_multiplier',
        inputType: 'number',
        min: 0,
        max: 3,
        step: 0.1,
        align: 'center',
        width: '20%',
        editable: true,
      },
      {
        title: `Star-rating off`,
        dataIndex: 'star_rating_on_off',
        inputType: 'number',
        min: 0,
        max: 1,
        step: 1,
        align: 'center',
        width: '20%',
        editable: true,
        render: (text, record) => (text ? 'Off' : 'On')
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        align: 'center',
        width: '20%',
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
  }

  stringSorter = (key) => (a, b) => {
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
        const result = await this.props.UpdateVideoTotalParameter({
          variables: {
            id: key,
            minutes_watched_multiplier: parseFloat(row.minutes_watched_multiplier),
            exponent_for_minutes_watched: parseFloat(row.exponent_for_minutes_watched),
            star_rating_multiplier: parseFloat(row.star_rating_multiplier),
            star_rating_on_off: parseInt(row.star_rating_on_off)
          }
        });
        if (result) {
          const newData = [...this.state.data];
          const index = newData.findIndex(item => key === item.key);
          if (index > -1) {
            const item = newData[index];
            newData.splice(index, 1, {
              ...item,
              ...row,
            });
            this.setState({ data: newData, editingKey: '' });
          }
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
      query: VIDEO_TOTAL_PARAMETER_QUERY,
      variables: { },
    });
    this.setState({
      data: data.videoTotalParameterses.map(d => ({...d, key: d.id}))
    });
  }

  render() {
    const components = {
      body: {
        cell: EditableCell,
      },
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          inputType: col.inputType ? col.inputType : 'text',
          inputFormat: col.inputFormat,
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

const VideoTotalParameterTable = compose(
	graphql(UPDATE_VIDEO_TOTAL_PARAMETER, {
		name: "UpdateVideoTotalParameter",
		options: props => ({
			variables: {
        id: props.id,
        minutes_watched_multiplier: props.minutes_watched_multiplier,
        exponent_for_minutes_watched: props.exponent_for_minutes_watched,
        star_rating_multiplier: props.star_rating_multiplier,
        star_rating_on_off: props.star_rating_on_off
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
  graphql(VIDEO_TOTAL_PARAMETER_QUERY, {
    name: "GetVideoTotalParameters",
    options: props => ({
        variables: {
        },
        fetchPolicy: "cache-and-network",
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
)(VideoTotalParameterTableComp);

export default withApollo(Form.create({name: 'VideoTotalParameterTable'})(VideoTotalParameterTable));