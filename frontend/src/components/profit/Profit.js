import React, { Component } from "react";
import gql from "graphql-tag";
import { Query, withApollo } from "react-apollo";
import { compose, graphql } from "react-apollo/index";
import { Table, Input, InputNumber, Popconfirm, Form, notification } from 'antd';
import 'antd/dist/antd.css';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import moment from 'moment';
import { Line, Bar, Pie } from 'react-chartjs-2';
import logger from "../../util/logger";
import Menu from "../../components/menu";
import TextField from '@material-ui/core/TextField';
import ArtistFactorTable from "./ArtistFactorTable";
import VideoTotalParameterTable from "./VideoTotalParameterTable";
import ProfitPoolFactorTable from "./ProfitPoolFactorTable";
import VideoParameterTable from "./VideoParameterTable";

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
    query GetStats($payoutStatsBeginDate: DateTime!, $payoutStatsEndDate: DateTime!, $year: Int!, $month: Int!) {
			payoutStats(
				beginDate: $payoutStatsBeginDate
				endDate: $payoutStatsEndDate
			) {
				artists {
					id
					firstname
					lastname
					username
					email
					approved
					promo_code
					payout_amount
					payout_months_total
					promo_code_uses
					timespans {
						year
						month
						payout_amount
						due_amount
					}
				}
				due_months {
					year
					month
					due_amount
				}
			}
			videoDataForMonthStats(
				year: $year
				month: $month
			) {
				id,
				year,
				month,
				video {
					id,
					title
				},
				video_length,
				unique_users,
				real_minutes_watched,
				avg_minutes_watched,
				exponent_applied,
				minutes_after_exponent
			}
			availableBalance
    }
`;

const TRANSFER_MONTH = gql`
    mutation Transfer($year: Int, $month: Int) {
        transfer(year: $year, month: $month)
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

	handlePayMonth = async (year, month) => {
		try {
			return await this.props.transfer({
				variables: {
					year: year,
					month: month
				}
			});
		} catch (ex) {
			notification['error']({
				message: 'Error!',
				description: ex.message,
			});
			return;
		}
	};

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

	render() {

		const { payoutStats } = this.state;
		// console.log('############# request', payoutStats.type)

		return <Query errorPolicy={"ignore"}
			fetchPolicy={"no-cache"}
			query={STATS_QUERY}
			variables={{
				payoutStatsBeginDate: payoutStats.beginDate,
				payoutStatsEndDate: payoutStats.endDate,
				year: parseInt(moment().format('YYYY')),
				month: parseInt(moment().format('MM'))
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
							title: 'Verified',
							dataIndex: 'approved',
							key: 'approved',
							sorter: this.stringSorter('approved'),
							render: (val) => { return val ? 'Yes' : 'No' }
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

					if(data.payoutStats.artists && data.payoutStats.artists.length > 0) {
						for(let i=0; i<data.payoutStats.artists[0].timespans.length; i++) {
							const d = data.payoutStats.artists[0].timespans[i];
							payout_table_columns.push({
								title: `${d.year}-${d.month}`,
								dataIndex: `${d.year}-${d.month}`,
								key: `${d.year}-${d.month}`,
							});
						}

						data.payoutStats.artists.map(v => {
							let val = {};
							for(let i=0; i<v.timespans.length; i++) {
								const d = v.timespans[i];
								val[`${d.year}-${d.month}`] = `${(d.due_amount / 100.0).toFixed(2)}/${(d.payout_amount / 100.0).toFixed(2)}`;
							}
							let sum = 0;
							payout_table_data.push({
								...v,
								...val
							});
							
						});
					}
					// console.log('############### payout_table_columns payout_table_data', payout_table_columns, payout_table_data)

					let due_total = 0;
					data.payoutStats.due_months.map(d => {
						due_total += parseInt(d.due_amount);
					});

					// Video data for month
					const video_data_for_month_table_columns = [
						{
							title: 'Video',
							dataIndex: 'video.title',
							key: 'id',
							sorter: this.stringSorter('video.title')
						},
						{
							title: 'Total video length',
							dataIndex: 'video_length',
							key: 'video_length',
							sorter: this.stringSorter('approved'),
							align: 'center',
						},
						{
							title: 'Total unique users who viewed',
							dataIndex: 'unique_users',
							key: 'unique_users',
							align: 'center',
						},
						{
							title: 'Real minutes watched',
							dataIndex: 'real_minutes_watched',
							key: 'payout_amount',
							align: 'center',
						},
						{
							title: 'Average minutes watched',
							dataIndex: 'avg_minutes_watched',
							key: 'avg_minutes_watched',
							align: 'center',
						},
						{
							title: 'Exponent applied to average',
							dataIndex: 'exponent_applied',
							key: 'exponent_applied',
							align: 'center',
						},
						{
							title: 'Total minutes watched after exponent',
							dataIndex: 'minutes_after_exponent',
							key: 'minutes_after_exponent',
							align: 'center',
						},
					]
					
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
													<h3>Profit Sharing</h3>
												</div>
											</div>
											<div className="col-md-12">
													<h6 style={{ height: 36, marginTop: 20 }}>Available balance: ${ (data.availableBalance / 100).toFixed(2) }</h6> 
											</div>

											{data.payoutStats.due_months.map(due_month => {
												return (
													<div className="col-md-12">
														<h6 className="float-left" style={{ height: 36, marginTop: 10, width: 180 }}>{`Due for ${due_month.year}-${due_month.month}`}:  ${(due_month.due_amount / 100).toFixed(2)}</h6>
														<button
															type="button"
															className="btn btn-warning border-none"
															style={{ marginLeft: 10, minWidth: 152 }}
															onClick={() => this.handlePayMonth(due_month.year, due_month.month)}
														>
															Payout for {`${due_month.year}-${due_month.month}`}
														</button>
													</div>
												)
											})}

											{/* <div className="col-md-12">
												<h6 className="float-left" style={{ height: 36, marginTop: 10, width: 180 }}>Due Total:  ${(due_total / 100).toFixed(2)}</h6>
												<button
													type="button"
													className="btn btn-warning border-none"
													style={{ marginLeft: 10, minWidth: 152 }}
												>
													Payout All
												</button>
											</div> */}
											
											<div className="col-md-2 col-xs-12 mh-auto" style={{ marginTop: 30 }}>
												<span style={{ color: 'white' }}>from</span>
												<TextField
													type="date"
													defaultValue={this.state.payoutStats.beginDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleFromDateChange}
												/>
											</div>
											<div className="col-md-3 col-xs-12 mh-auto" style={{ marginTop: 30 }}>
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
													bordered
													columns={payout_table_columns}
													dataSource={payout_table_data}
													size='small'
													pagination={false}
												/>
											</div>

											<div className="col-md-12 mt-5">
												<div className="main-title">
													<h4>Profit Sharing Setting</h4>
												</div>
											</div>

											<div className="col-md-12 mt-4">
												<h5>Artist factors</h5>
											</div>
											<div className="col-md-12">
												<ArtistFactorTable />
											</div>

											<div className="col-md-12 mt-4">
												<h5>Video parameters</h5>
											</div>
											<div className="col-md-12">
												<VideoParameterTable />
											</div>

											<div className="col-md-12 mt-4">
												<h5>Video total parameters</h5>
											</div>
											<div className="col-md-12">
												<VideoTotalParameterTable />
											</div>

											<div className="col-md-12 mt-4">
												<h5>Profit pool factors</h5>
											</div>
											<div className="col-md-12">
												<ProfitPoolFactorTable />
											</div>

											<div className="col-md-12 mt-4">
												<h5>Video data for month</h5>
											</div>
											<div className="col-md-12">
												<Table
													bordered
													columns={video_data_for_month_table_columns}
													dataSource={data.videoDataForMonthStats}
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

const ProfitPage = compose(
	graphql(TRANSFER_MONTH, {
		name: "transfer",
		options: props => ({
			variables: {
				year: props.year,
				month: props.month
			},
			onCompleted: (res) => {
				if (res) {
					location.reload();
				}
				else {
					notification['error']({
						message: 'Error!',
						description: "Unknown error occured!",
					});
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
	})
)(Profit);

export default withApollo(ProfitPage);

