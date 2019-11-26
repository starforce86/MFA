import React, { Component } from "react";
import gql from "graphql-tag";
import { Query, withApollo } from "react-apollo";
import { compose, graphql } from "react-apollo/index";
import { Table, Input, InputNumber, Popconfirm, Form, notification, Button, Icon } from 'antd';
import 'antd/dist/antd.css';
import logger from "../../util/logger";
import { async } from "q";

const log = logger('ArtistFactorTable');

const ARTIST_FACTORS_QUERY = gql`
    query GetArtistFactors {
			artistFactorses {
        id,
				artist {
          id
          email
        }
        promotion_factor
        minutes_exponent
        finder_fee_factor
        monthly_fee_duration
        monthly_fee_amount_per_month
        annual_fee_amount_per_month
			}
    }
`;

const UPDATE_ARTISTFACTOR = gql`
    mutation UpdateArtistFactor(
      $id: ID, 
      $promotion_factor: Float, 
      $minutes_exponent: Float, 
      $finder_fee_factor: Float, 
      $monthly_fee_duration: Int, 
      $monthly_fee_amount_per_month: Int,
      $annual_fee_amount_per_month: Int
    ) {
        updateArtistFactors(
            where: { id: $id }
            data: {
              promotion_factor: $promotion_factor
              minutes_exponent: $minutes_exponent
              finder_fee_factor: $finder_fee_factor
              monthly_fee_duration: $monthly_fee_duration
              monthly_fee_amount_per_month: $monthly_fee_amount_per_month
              annual_fee_amount_per_month: $annual_fee_amount_per_month
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

class ArtistFactorTableComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      editingKey: '',
      data: [],
    };
    this.columns = [
      {
        title: 'Artist',
        dataIndex: 'artist.email',
        align: 'left',
        sorter: this.stringSorter('artist.email'),
        width: '25%',
      },
      {
        title: 'Artist promotion factor',
        dataIndex: 'promotion_factor',
        inputType: 'number',
        min: 0.3,
        max: 3,
        step: 0.1,
        align: 'center',
        width: '10%',
        editable: true,
      },
      {
        title: 'Artist minutes exponent',
        dataIndex: 'minutes_exponent',
        inputType: 'number',
        min: 0.3,
        max: 3,
        step: 0.1,
        align: 'center',
        width: '10%',
        editable: true,
      },
      {
        title: `Finder's Fee factor`,
        dataIndex: 'finder_fee_factor',
        inputType: 'number',
        min: 0,
        max: 3,
        step: 0.25,
        align: 'center',
        width: '10%',
        editable: true,
      },
      {
        title: `Monthly Finder's fee duration`,
        dataIndex: 'monthly_fee_duration',
        inputType: 'number',
        min: 0,
        max: 12,
        step: 1,
        align: 'center',
        width: '10%',
        editable: true,
      },
      {
        title: `Monthly Finder's fee amount per month`,
        dataIndex: 'monthly_fee_amount_per_month',
        inputType: 'number',
        inputFormat: 'money',
        min: 0,
        max: 20,
        step: 1,
        align: 'center',
        width: '10%',
        editable: true,
        render: (text, record) => (`$${text}`)
      },
      {
        title: `Annual finder's fee amount`,
        dataIndex: 'annual_fee_amount_per_month',
        inputType: 'number',
        inputFormat: 'money',
        min: 0,
        max: 100,
        step: 1,
        align: 'center',
        width: '10%',
        editable: true,
        render: (text, record) => (`$${text}`)
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
        const result = await this.props.UpdateArtistFactor({
          variables: {
            id: key,
            promotion_factor: parseFloat(row.promotion_factor),
            minutes_exponent: parseFloat(row.minutes_exponent),
            finder_fee_factor: parseFloat(row.finder_fee_factor),
            monthly_fee_duration: parseInt(row.monthly_fee_duration),
            monthly_fee_amount_per_month: parseInt(row.monthly_fee_amount_per_month),
            annual_fee_amount_per_month: parseInt(row.annual_fee_amount_per_month)
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
      query: ARTIST_FACTORS_QUERY,
      variables: { },
    });
    this.setState({
      data: data.artistFactorses.map(d => ({ ...d, key: d.id }))
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

const ArtistFactorTable = compose(
	graphql(UPDATE_ARTISTFACTOR, {
		name: "UpdateArtistFactor",
		options: props => ({
			variables: {
        id: props.id,
        promotion_factor: props.promotion_factor,
        minutes_exponent: props.minutes_exponent,
        finder_fee_factor: props.finder_fee_factor,
        monthly_fee_duration: props.monthly_fee_duration,
        monthly_fee_amount_per_month: props.monthly_fee_amount_per_month,
        annual_fee_amount_per_month: props.annual_fee_amount_per_month
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
  // graphql(ARTIST_FACTORS_QUERY, {
  //   name: "GetArtistFactors",
  //   options: props => ({
  //       variables: {
  //       },
  //       fetchPolicy: "cache-and-network",
  //       onCompleted: async (result) => {
  //           return result;
  //       },
  //       onError: async (errors) => {
  //         let errs = JSON.stringify(errors);
  //         //TODO return error to component
  //         log.trace(errs);
  //         if (errors && errors.graphQLErrors && errors.graphQLErrors.length > 0) {
  //           const errMsg = errors.graphQLErrors.map(e => e.message ? e.message : "").join(" ");
  //           notification['error']({
  //             message: 'Error!',
  //             description: errMsg,
  //           });
  //         } else {
  //           notification['error']({
  //             message: 'Error!',
  //             description: "Unknown error occured!",
  //           });
  //         }
  //         return { error: true }
  //     }
  //   })
  // })
)(ArtistFactorTableComp);

export default withApollo(Form.create({name: 'ArtistFactorTable'})(ArtistFactorTable));