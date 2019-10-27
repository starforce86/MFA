import React, { Component } from "react";
import gql from "graphql-tag";
import { Query, withApollo } from "react-apollo";
import { compose, graphql } from "react-apollo/index";
import { Table } from 'antd';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import moment from 'moment';
import { Line, Bar, Pie } from 'react-chartjs-2';
import logger from "../../util/logger";
import Menu from "../../components/menu";
import 'antd/dist/antd.css';
import TextField from '@material-ui/core/TextField';

const log = logger('Profit');
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const dateOnlyFormat = 'YYYY-MM-DD';
const monthOnlyFormat = 'YYYY-MM';
const yearOnlyFormat = 'YYYY';
const charge_line_options = {
	legend: {
		position: 'bottom'
	},
	scales: {
		yAxes: [{
			scaleLabel: {
				display: true,
				labelString: '$',
			},
			ticks: {
				suggestedMin: 0
			}
		}],
		xAxes: [{
			scaleLabel: {
				display: false,
			}
		}],
	}
};
const subscription_line_options = {
	legend: {
		position: 'bottom'
	},
	scales: {
		yAxes: [{
			scaleLabel: {
				display: true,
				labelString: 'Count',
			},
			ticks: {
				suggestedMin: 0
			}
		}],
		xAxes: [{
			scaleLabel: {
				display: false,
			}
		}],
	}
};
const signup_line_options = {
	legend: {
		position: 'bottom'
	},
	scales: {
		yAxes: [{
			scaleLabel: {
				display: true,
				labelString: 'Count',
			},
			ticks: {
				suggestedMin: 0
			}
		}],
		xAxes: [{
			scaleLabel: {
				display: false,
			}
		}],
	}
};
const line_colors = [
	"142,29,15",
	"187,172,74",
	"141,126,188",
]

const STATS_QUERY = gql`
    query GetStats($payoutStatsBeginDate: DateTime!, $payoutStatsEndDate: DateTime!) {
			payoutStats(
				beginDate: $payoutStatsBeginDate
				endDate: $payoutStatsEndDate
			) {
				id
				firstname
				lastname
				username
				email
				promo_code
				payout_amount
				payout_months_total
				promo_code_uses
				timespans {
					year
					month
					amount
				}
			}
    }
`;

class Profit extends Component {

	state = {
		payoutStats: {
			beginDate: moment().subtract(moment.duration(1, 'years')).format(dateOnlyFormat),
			endDate: moment().format(dateOnlyFormat)
		}
	}

	constructor(props) {
		super(props);
	}

	handleFromDateChange = (e) => {
		if(e.target.value < this.state.payoutStats.endDate) {
			this.setState({
				payoutStats: {
					...this.state.payoutStats,
					beginDate: e.target.value
				}
			});
		}
	}

	handleToDateChange = (e) => {
		if(e.target.value > this.state.payoutStats.beginDate) {
			this.setState({
				payoutStats: {
					...this.state.payoutStats,
					endDate: e.target.value
				}
			});
		}
	}

	stringSorter = (key) => (a, b) => {
		if (a[key] < b[key]) { return -1; }
		if (a[key] > b[key]) { return 1; }
		return 0;
	}

	render() {

		const { payoutStats } = this.state;
		// console.log('############# request', payoutStats.type)

		return <Query errorPolicy={"ignore"}
			fetchPolicy={"no-cache"}
			query={STATS_QUERY}
			variables={{
				payoutStatsBeginDate: payoutStats.beginDate,
				payoutStatsEndDate: payoutStats.endDate
			}}>
			{
				({ loading, error, data }) => {
					if (loading) return <div>Loading...</div>;
					if (error) return <div>Error</div>;
					console.log('############# response', data)

					let payout_table_columns = [
						{
							title: 'Artist',
							dataIndex: 'email',
							key: 'email',
							sorter: this.stringSorter('email')
						},
						{
							title: 'Promo code',
							dataIndex: 'promo_code',
							key: 'promo_code',
							sorter: this.stringSorter('promo_code')
						},
						{
							title: 'kickback($)',
							dataIndex: 'payout_amount',
							key: 'payout_amount',
							render: (text) => { return (text / 100).toFixed(2) }
						},
						{
							title: 'How long(month)',
							dataIndex: 'payout_months_total',
							key: 'payout_months_total',
						},
						{
							title: 'Promo code uses',
							dataIndex: 'promo_code_uses',
							key: 'promo_code_uses',
						},
					];
					let payout_table_data = [];

					if(data.payoutStats && data.payoutStats.length > 0) {
						for(let i=0; i<data.payoutStats[0].timespans.length; i++) {
							const d = data.payoutStats[0].timespans[i];
							payout_table_columns.push({
								title: `${d.year}-${d.month}`,
								dataIndex: `${d.year}-${d.month}`,
								key: `${d.year}-${d.month}`,
							});
						}

						data.payoutStats.map(v => {
							let val = {};
							for(let i=0; i<v.timespans.length; i++) {
								const d = v.timespans[i];
								val[`${d.year}-${d.month}`] = (d.amount / 100.0).toFixed(2);
							}
							let sum = 0;
							payout_table_data.push({
								...v,
								...val
							});
							
						});
					}
					// console.log('############### payout_table_columns payout_table_data', payout_table_columns, payout_table_data)
					
					return (
						<Menu>
							<div id="content-wrapper">
								<div className="container-fluid pb-0">
									<div className="top-mobile-search">
										<div className="row">
											<div className="col-md-12">
												<form action="/" method="get"
													className="mobile-search">
													<div className="input-group">
														<input
															style={{ color: "#FFF" }}
															name="search"
															type="text"
															placeholder="Search for..."
															className="form-control"
														/>
														<div className="input-group-append">
															<button type="button" className="btn btn-dark">
																<i className="fas fa-search" />
															</button>
														</div>
													</div>
												</form>
											</div>
										</div>
									</div>

									<div className="video-block section-padding">
										<div className="row">
											<div className="col-md-12">
												<div className="main-title">
													<h4>Profit Sharing</h4>
												</div>
											</div>
											<div className="col-md-2 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>from</span>
												<TextField
													type="date"
													defaultValue={this.state.payoutStats.beginDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleFromDateChange}
												/>
											</div>
											<div className="col-md-3 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>to</span>
												<TextField
													type="date"
													defaultValue={this.state.payoutStats.endDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleToDateChange}
												/>
											</div>
											<div className="col-md-12" style={{ marginTop: 30 }}>
												<Table
													columns={payout_table_columns}
													dataSource={payout_table_data}
													size='small'
													pagination={false}
												/>
											</div>
										</div>
									</div>
									<hr className="mt-0" />
								</div>
								{/* /.container-fluid */}
							</div>
						</Menu>
					)
				}
			}
		</Query>;
	}
}

export default withApollo(Profit);

