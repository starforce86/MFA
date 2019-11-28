import React, { Component } from "react";
import gql from "graphql-tag";
import { Query, withApollo } from "react-apollo";
import { compose, graphql } from "react-apollo/index";
import { Table, Input, InputNumber, Popconfirm, Form, notification, Button, Icon, Checkbox } from 'antd';
import 'antd/dist/antd.css';
import logger from "../../util/logger";
import { async } from "q";

const log = logger('ProfitPoolFactorTable');

const PROFIT_POOL_FACTOR_QUERY = gql`
    query GetProfitPoolFactor {
			profitPoolFactors {
        id,
				overhead,
        monthly_multiplier,
        finder_fee_multiplier,
        profit_pool_option1_variable,
        profit_pool_option1_multiplier,
        profit_pool_option2_variable,
        profit_pool_option2_multiplier,
        profit_pool_percentage,
        manual_change
			}
    }
`;

const UPDATE_PROFIT_POOL_FACTOR = gql`
    mutation UpdateProfitPoolFactor(
      $id: ID, 
      $overhead: Int, 
      $monthly_multiplier: Float, 
      $finder_fee_multiplier: Float, 
      $profit_pool_option1_variable: Int,
      $profit_pool_option1_multiplier: Float, 
      $profit_pool_option2_variable: Int, 
      $profit_pool_option2_multiplier: Float, 
      $profit_pool_percentage: Int, 
      $manual_change: Int
    ) {
        updateProfitPoolFactor(
            where: { id: $id }
            data: {
              overhead: $overhead
              monthly_multiplier: $monthly_multiplier
              finder_fee_multiplier: $finder_fee_multiplier
              profit_pool_option1_variable: $profit_pool_option1_variable
              profit_pool_option1_multiplier: $profit_pool_option1_multiplier
              profit_pool_option2_variable: $profit_pool_option2_variable
              profit_pool_option2_multiplier: $profit_pool_option2_multiplier
              profit_pool_percentage: $profit_pool_percentage
              manual_change: $manual_change
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

class ProfitPoolFactorTableComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      editingKey: '',
      data: [],
    };
    this.columns = [
      {
        title: 'Overhead',
        dataIndex: 'overhead',
        inputType: 'number',
        inputFormat: 'money',
        min: 0,
        max: 10000,
        step: 1,
        align: 'center',
        width: '10%',
        editable: true,
        render: (text, record) => (`$${text}`)
      },
      {
        title: 'Monthly multiplier',
        dataIndex: 'monthly_multiplier',
        inputType: 'number',
        min: 0,
        max: 3,
        step: 0.1,
        align: 'center',
        width: '10%',
        editable: true,
      },
      {
        title: `Finder's Fee multiplier`,
        dataIndex: 'finder_fee_multiplier',
        inputType: 'number',
        min: 0,
        max: 3,
        step: 0.1,
        align: 'center',
        width: '10%',
        editable: true,
      },
      {
        title: `Profilt Pool Option 1 variable`,
        dataIndex: 'profit_pool_option1_variable',
        inputType: 'number',
        inputFormat: 'money',
        min: -10000,
        max: 10000,
        step: 1,
        align: 'center',
        width: '10%',
        editable: true,
        render: (text, record) => (`$${text}`)
      },
      {
        title: `Profit Pool Option 1 Multiplier`,
        dataIndex: 'profit_pool_option1_multiplier',
        inputType: 'number',
        min: 0,
        max: 3,
        step: 0.1,
        align: 'center',
        width: '7%',
        editable: true,
      },
      {
        title: `Profit Pool percentage`,
        dataIndex: 'profit_pool_percentage',
        inputType: 'number',
        inputFormat: 'percentage',
        min: 0,
        max: 100,
        step: 0.5,
        align: 'center',
        width: '10%',
        editable: true,
        render: (text, record) => (`${text}%`)
      },
      {
        title: `Profilt Pool Option 2 variable`,
        dataIndex: 'profit_pool_option2_variable',
        inputType: 'number',
        inputFormat: 'money',
        min: -10000,
        max: 10000,
        step: 1,
        align: 'center',
        width: '10%',
        editable: true,
        render: (text, record) => (`$${text}`)
      },
      {
        title: `Profit Pool Option 2 Multiplier`,
        dataIndex: 'profit_pool_option2_multiplier',
        inputType: 'number',
        min: 0,
        max: 3,
        step: 0.1,
        align: 'center',
        width: '8%',
        editable: true,
      },
      {
        title: `Manual change`,
        dataIndex: 'manual_change',
        inputType: 'number',
        inputFormat: 'money',
        min: -10000,
        max: 10000,
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
        const result = await this.props.UpdateProfitPoolFactor({
          variables: {
            id: key,
            overhead: parseInt(row.overhead),
            monthly_multiplier: parseFloat(row.monthly_multiplier),
            finder_fee_multiplier: parseFloat(row.finder_fee_multiplier),
            profit_pool_option1_variable: parseInt(row.profit_pool_option1_variable),
            profit_pool_option1_multiplier: parseFloat(row.profit_pool_option1_multiplier),
            profit_pool_option2_variable: parseInt(row.profit_pool_option2_variable),
            profit_pool_option2_multiplier: parseFloat(row.profit_pool_option2_multiplier),
            profit_pool_percentage: parseInt(row.profit_pool_percentage),
            manual_change: parseInt(row.manual_change)
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
      query: PROFIT_POOL_FACTOR_QUERY,
      variables: { },
      fetchPolicy: "no-cache",
      errorPolicy: "all"
    });
    this.setState({
      data: data.profitPoolFactors.map(d => ({...d, key: d.id}))
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

const ProfitPoolFactorTable = compose(
	graphql(UPDATE_PROFIT_POOL_FACTOR, {
		name: "UpdateProfitPoolFactor",
		options: props => ({
			variables: {
        id: props.id,
        overhead: props.overhead,
        monthly_multiplier: props.monthly_multiplier,
        finder_fee_multiplier: props.finder_fee_multiplier,
        profit_pool_option1_variable: props.profit_pool_option1_variable,
        profit_pool_option1_multiplier: props.profit_pool_option1_multiplier,
        profit_pool_option2_variable: props.profit_pool_option2_variable,
        profit_pool_option2_multiplier: props.profit_pool_option2_multiplier,
        profit_pool_percentage: props.profit_pool_percentage,
        manual_change: props.manual_change
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
  graphql(PROFIT_POOL_FACTOR_QUERY, {
    name: "GetProfitPoolFactor",
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
)(ProfitPoolFactorTableComp);

export default withApollo(Form.create({name: 'ProfitPoolFactorTable'})(ProfitPoolFactorTable));