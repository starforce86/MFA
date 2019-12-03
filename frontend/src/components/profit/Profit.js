import React, { Component } from "react";
import gql from "graphql-tag";
import { Query, withApollo } from "react-apollo";
import { compose, graphql } from "react-apollo/index";
import { Table, Input, InputNumber, Popconfirm, Form, notification, DatePicker, Spin, Modal } from 'antd';
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
import * as consts from "../../util/consts";
import { async } from "q";

const { MonthPicker } = DatePicker;
const log = logger('Profit');
const dateOnlyFormat = 'YYYY-MM-DD';

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

const STATS_QUERY = gql`
    query GetStats($year: Int!, $month: Int!) {
			payoutStats(
				year: $year
				month: $month
			) {
				paid
				due
			}
			availableBalance
    }
`;

const VIDEO_DATA_FOR_MONTH_QUERY = gql`
    query GetVideoDataForMonth($year: Int!, $month: Int!) {
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
    }
`;

const VIDEO_PARAMETERS_FOR_MONTH_QUERY = gql`
    query GetVideoParametersForMonth($year: Int!, $month: Int!) {
			videoParametersForMonthStats(
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
				owner1 {
					id,
					email
				},
				owner2 {
					id,
					email
				},
				owner3 {
					id,
					email
				},
				owner1_percentage,
				owner2_percentage,
				owner3_percentage,
				total_minutes,
				owner1_minutes,
				owner2_minutes,
				owner3_minutes
			}
    }
`;

const TOTAL_MINUTES_FOR_ARTIST_QUERY = gql`
    query GetTotalMinutesForArtistStats($year: Int!, $month: Int!) {
			totalMinutesForArtistStats(
				year: $year
				month: $month
			) {
				id,
				year,
				month,
				artist {
					id,
					email
				},
				minutes_as_owner1,
				minutes_as_owner2,
				minutes_as_owner3,
				total_minutes,
				artist_rating_factor,
				final_minutes,
				percent_of_profit_pool,
				monthly_quantity,
				annual_quantity,
				finder_fee,
				payment_from_profit_pool,
				total_payment
			}
    }
`;

const PROFIT_POOL_QUERY = gql`
    query GetProfitPoolCalculationStats($year: Int!, $month: Int!) {
			profitPoolCalculationStats(
				year: $year
				month: $month
			) {
				id,
				year,
				month,
				annual_active_subscribers,
				monthly_active_subscribers,
				annual_subscription_rate,
				monthly_subscription_rate,
				annual_pool_revenue,
				monthly_pool_revenue,
    		total_revenue,
				total_payments_to_artists,
				net_revenue_mfa
			}
    }
`;

const TRANSFER_MONTH = gql`
    mutation Transfer($year: Int, $month: Int) {
        transfer(year: $year, month: $month)
    }
`;

const payout_table_columns = [
	{
		title: 'Artist',
		dataIndex: 'email',
		key: 'email',
		sorter: stringSorter('email')
	},
	{
		title: 'Verified',
		dataIndex: 'approved',
		key: 'approved',
		sorter: stringSorter('approved'),
		render: (val) => { return val ? 'Yes' : 'No' }
	},
	{
		title: 'Promo code',
		dataIndex: 'promo_code',
		key: 'promo_code',
		sorter: stringSorter('promo_code')
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

const profit_pool_calc1_table_columns = [
	{
		title: `Finder's Fees`,
		dataIndex: 'artist.email',
		key: 'id',
		sorter: stringSorter('artist.email'),
		align: 'left',
	},
	{
		title: 'Monthly (quantity)',
		dataIndex: 'monthly_quantity',
		key: 'monthly_quantity',
		align: 'right',
	},
	{
		title: 'Annual (quantity)',
		dataIndex: 'annual_quantity',
		key: 'annual_quantity',
		align: 'right',
	},
	{
		title: `Total Finder's Fees`,
		dataIndex: 'finder_fee',
		key: 'finder_fee',
		align: 'right',
		render: (text, record) => (`$${text}`)
	},
];

const profit_pool_calc2_table_columns = [
	{
		title: `Artist Payments`,
		dataIndex: 'artist.email',
		key: 'id',
		sorter: stringSorter('artist.email'),
		align: 'left',
	},
	{
		title: '% of Profit Pool',
		dataIndex: 'percent_of_profit_pool',
		key: 'percent_of_profit_pool',
		align: 'right',
		render: (text, record) => (`${text}%`)
	},
	{
		title: 'Payment from Profit Pool',
		dataIndex: 'payment_from_profit_pool',
		key: 'payment_from_profit_pool',
		align: 'right',
		render: (text, record) => (`$${text}`),
	},
	{
		title: `Payment from Finder's Fees`,
		dataIndex: 'finder_fee',
		key: 'finder_fee',
		align: 'right',
		render: (text, record) => (`$${text}`),
	},
	{
		title: `Total Payment`,
		dataIndex: 'total_payment',
		key: 'total_payment',
		align: 'right',
		render: (text, record) => (`$${text}`),
	},
];

const last_table_columns = [
	{
		title: `Title`,
		dataIndex: 'title',
		key: 'title',
		align: 'left',
	},
	{
		title: '$',
		dataIndex: 'amount',
		key: 'amount',
		align: 'right',
		render: (text, record) => (`$${text}`)
	},
];

class Profit extends Component {

	state = {
		loading: false,
		availableBalance: 0,
		selectedYear: moment().format('YYYY'),
		selectedMonth: moment().format('MM'),
		payoutStats: {
			paid: 0,
			due: 0,
		},
		video_data_for_month: {
			table_data: [],
			table_columns: [
				{
					title: 'Video',
					dataIndex: 'video.title',
					key: 'id',
					sorter: stringSorter('video.title')
				},
				{
					title: 'Total video length',
					dataIndex: 'video_length',
					key: 'video_length',
					sorter: stringSorter('approved'),
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
			],
		},
		video_parameters_for_month: {
			table_data: [],
			table_columns: [
				{
					title: 'Video',
					dataIndex: 'video.title',
					key: 'id',
					sorter: stringSorter('video.title')
				},
				{
					title: 'Owner 1',
					dataIndex: 'owner1.email',
					key: 'owner1_email',
					sorter: stringSorter('owner1.email'),
					align: 'center',
					render: (text, record) => (record.owner1 ? `${record.owner1.email}` : 'None')
				},
				{
					title: 'Owner 1 Percentage',
					dataIndex: 'owner1_percentage',
					key: 'owner1_percentage',
					align: 'center',
					render: (text, record) => (`${text}%`),
				},
				{
					title: 'Owner 2',
					dataIndex: 'owner2.email',
					key: 'owner2_email',
					align: 'center',
					render: (text, record) => (record.owner2 ? `${record.owner2.email}` : 'None')
				},
				{
					title: 'Owner 2 Percentage',
					dataIndex: 'owner2_percentage',
					key: 'owner2_percentage',
					align: 'center',
					render: (text, record) => (`${text}%`),
				},
				{
					title: 'Owner 3',
					dataIndex: 'owner3.email',
					key: 'owner3_email',
					align: 'center',
					render: (text, record) => (record.owner3 ? `${record.owner3.email}` : 'None')
				},
				{
					title: 'Owner 3 Percentage',
					dataIndex: 'owner3_percentage',
					key: 'owner3_percentage',
					align: 'center',
					render: (text, record) => (`${text}%`),
				},
				{
					title: 'Total minutes',
					dataIndex: 'total_minutes',
					key: 'total_minutes',
					align: 'center',
				},
				{
					title: 'Owner 1 minutes',
					dataIndex: 'owner1_minutes',
					key: 'owner1_minutes',
					align: 'center',
				},
				{
					title: 'Owner 2 minutes',
					dataIndex: 'owner2_minutes',
					key: 'owner2_minutes',
					align: 'center',
				},
				{
					title: 'Owner 3 minutes',
					dataIndex: 'owner3_minutes',
					key: 'owner3_minutes',
					align: 'center',
				},
			],
		},
		minutes_for_artist: {
			table_data: [],
			table_columns: [
				{
					title: 'Artist/Owner',
					dataIndex: 'artist.email',
					key: 'id',
					align: 'left',
					sorter: stringSorter('artist.title')
				},
				{
					title: 'Minutes as Owner 1',
					dataIndex: 'minutes_as_owner1',
					key: 'minutes_as_owner1',
					align: 'right',
				},
				{
					title: 'Minutes as Owner 2',
					dataIndex: 'minutes_as_owner2',
					key: 'minutes_as_owner2',
					align: 'right',
				},
				{
					title: 'Minutes as Owner 3',
					dataIndex: 'minutes_as_owner3',
					key: 'minutes_as_owner3',
					align: 'right',
				},
				{
					title: 'Total minutes',
					dataIndex: 'total_minutes',
					key: 'total_minutes',
					align: 'right',
				},
				{
					title: 'Artist rating factor',
					dataIndex: 'artist_rating_factor',
					key: 'artist_rating_factor',
					align: 'right',
				},
				{
					title: 'Final minutes',
					dataIndex: 'final_minutes',
					key: 'final_minutes',
					align: 'right',
				},
				{
					title: '% of Profit Pool',
					dataIndex: 'percent_of_profit_pool',
					key: 'percent_of_profit_pool',
					align: 'right',
					render: (text, record) => (`${text}%`)
				},
			],
		},
		profit_pool: {
			table_data: [],
			table_columns: [
				{
					title: 'Profit Pool Gross',
					dataIndex: 'title',
					key: 'id',
					align: 'left',
				},
				{
					title: 'Number of active subscribers',
					dataIndex: 'active_subscribers',
					key: 'active_subscribers',
					align: 'right',
				},
				{
					title: 'Annual or monthly subscription rate',
					dataIndex: 'subscription_rate',
					key: 'subscription_rate',
					align: 'right',
					render: (text, record) => (`$${text}`)
				},
				{
					title: 'Amortized monthly pool revenue',
					dataIndex: 'pool_revenue',
					key: 'pool_revenue',
					align: 'right',
					render: (text, record) => (`$${text}`)
				},
			],
		},
		last_table_data: [],
	}

	constructor(props) {
		super(props);
	}

	handlePayMonth = () => {
		Modal.confirm({
			title: `Are you sure payout?`,
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk: async () => {
				await this.props.transfer({
					variables: {
						year: parseInt(this.state.selectedYear),
						month: parseInt(this.state.selectedMonth)
					}
				});
			},
		});
	};

	onChangeMonth = (date) => {

		if (!date) {
			notification['error']({
				message: 'Error!',
				description: "Month is empty! Please select a month",
			});
			return;
		}

		this.setState({
			selectedYear: moment(date).format('YYYY'),
			selectedMonth: moment(date).format('MM')
		}, () => {
			this.loadData();
		})
	}

	componentDidMount() {

		this.loadData();
	}

	loadData = async () => {

		const year = parseInt(this.state.selectedYear);
		const month = parseInt(this.state.selectedMonth);

		this.setState({
			loading: true
		});

    const { data: { videoDataForMonthStats }} = await this.props.client.query({
      query: VIDEO_DATA_FOR_MONTH_QUERY,
      variables: {
				year: year,
				month: month
			},
			fetchPolicy: "no-cache",
      errorPolicy: "all"
		});

		if (!videoDataForMonthStats) {
			notification['error']({
				message: 'Error!',
				description: "videoDataForMonthStats error occured!",
			});
		}

		this.setState({
			video_data_for_month: {
				...this.state.video_data_for_month,
					table_data: videoDataForMonthStats,
			}
		})

		const { data: { videoParametersForMonthStats }} = await this.props.client.query({
      query: VIDEO_PARAMETERS_FOR_MONTH_QUERY,
      variables: {
				year: year,
				month: month
			},
			fetchPolicy: "no-cache",
      errorPolicy: "all"
		});

		if (!videoParametersForMonthStats) {
			notification['error']({
				message: 'Error!',
				description: "videoParametersForMonthStats error occured!",
			});
		}

		this.setState({
			video_parameters_for_month: {
				...this.state.video_parameters_for_month,
					table_data: videoParametersForMonthStats,
			}
		})

		const { data: { totalMinutesForArtistStats } } = await this.props.client.query({
			query: TOTAL_MINUTES_FOR_ARTIST_QUERY,
			variables: {
				year: year,
				month: month
			},
			fetchPolicy: "no-cache",
			errorPolicy: "all"
		});

		if (!totalMinutesForArtistStats) {
			notification['error']({
				message: 'Error!',
				description: "totalMinutesForArtistStats error occured!",
			});
		}

		this.setState({
			minutes_for_artist: {
				...this.state.minutes_for_artist,
					table_data: totalMinutesForArtistStats,
			}
		})

		const { data: { profitPoolCalculationStats } } = await this.props.client.query({
      query: PROFIT_POOL_QUERY,
      variables: {
				year: year,
				month: month
			},
			fetchPolicy: "no-cache",
      errorPolicy: "all"
		});

		if (!profitPoolCalculationStats) {
			notification['error']({
				message: 'Error!',
				description: "profitPoolCalculationStats error occured!",
			});
		}

		if (profitPoolCalculationStats && profitPoolCalculationStats.length > 0) {
			const profit_pool_table_data = [
				{
					title: 'Annual subscriptions',
					active_subscribers: profitPoolCalculationStats[0].annual_active_subscribers,
					subscription_rate: profitPoolCalculationStats[0].annual_subscription_rate,
					pool_revenue: profitPoolCalculationStats[0].annual_pool_revenue,
				},
				{
					title: 'Monthly suscriptions',
					active_subscribers: profitPoolCalculationStats[0].monthly_active_subscribers,
					subscription_rate: profitPoolCalculationStats[0].monthly_subscription_rate,
					pool_revenue: profitPoolCalculationStats[0].monthly_pool_revenue,
				},
				{
					title: 'Total revenue',
					active_subscribers: '',
					subscription_rate: '',
					pool_revenue: profitPoolCalculationStats[0].total_revenue,
				},
			];
	
			this.setState({
				profit_pool: {
					...this.state.profit_pool,
						table_data: profit_pool_table_data,
				}
			})
		}

		let gross_revenue_mfa = 0;
		let total_payments_to_artists = 0;
		let net_revenue_mfa = 0;

		if (profitPoolCalculationStats && profitPoolCalculationStats.length > 0) {
			gross_revenue_mfa = profitPoolCalculationStats[0].total_revenue;
			total_payments_to_artists = profitPoolCalculationStats[0].total_payments_to_artists;
			net_revenue_mfa = profitPoolCalculationStats[0].net_revenue_mfa;
		}
		
		const last_table_data = [
			{
				title: 'Gross revenue MFA',
				amount: gross_revenue_mfa,
			},
			{
				title: 'Total payments to artists',
				amount: total_payments_to_artists,
			},
			{
				title: 'Net revenue MFA',
				amount: net_revenue_mfa,
			},
		];

		this.setState({
			last_table_data: last_table_data
		})

		const { data: { payoutStats, availableBalance }} = await this.props.client.query({
      query: STATS_QUERY,
      variables: {
				year: parseInt(this.state.selectedYear),
				month: parseInt(this.state.selectedMonth)
			},
			fetchPolicy: "no-cache",
      errorPolicy: "all"
		});

		if (!payoutStats) {
			notification['error']({
				message: 'Error!',
				description: "payoutStats error occured!",
			});
		}

		this.setState({
			payoutStats: payoutStats,
			availableBalance: availableBalance,
		})

		// let new_payout_table_columns = [];
		// let payout_table_data = [];

		// if(result.data.payoutStats.artists && result.data.payoutStats.artists.length > 0) {
		// 	for(let i=0; i<result.data.payoutStats.artists[0].timespans.length; i++) {
		// 		const d = result.data.payoutStats.artists[0].timespans[i];
		// 		new_payout_table_columns.push({
		// 			title: `${d.year}-${d.month}`,
		// 			dataIndex: `${d.year}-${d.month}`,
		// 			key: `${d.year}-${d.month}`,
		// 		});
		// 	}

		// 	result.data.payoutStats.artists.map(v => {
		// 		let val = {};
		// 		for(let i=0; i<v.timespans.length; i++) {
		// 			const d = v.timespans[i];
		// 			val[`${d.year}-${d.month}`] = `${(d.due_amount / 100.0).toFixed(2)}/${(d.payout_amount / 100.0).toFixed(2)}`;
		// 		}
		// 		let sum = 0;
		// 		payout_table_data.push({
		// 			...v,
		// 			...val
		// 		});
				
		// 	});

		// 	this.setState({
		// 		availableBalance: result.data.availableBalance,
		// 		payoutStats: {
		// 			...this.state.payoutStats,
		// 			table_columns: [
		// 				...payout_table_columns,
		// 				...new_payout_table_columns,
		// 			],
		// 			table_data: payout_table_data,
		// 		}
		// 	});
		// }

		this.setState({
			loading: false
		});
	}
	
	render() {
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

						<Spin spinning={this.state.loading}>
							<div className="video-block section-padding">
								<div className="row">
									<div className="col-md-12">
										<div className="main-title">
											<h3>Profit Sharing</h3>
										</div>
									</div>
									<div className="col-md-12">
										<MonthPicker onChange={this.onChangeMonth} defaultValue={moment(`${this.state.selectedYear}-${this.state.selectedMonth}`)} placeholder="Select month" />
									</div>
									<div className="col-md-12">
										<h6 style={{ height: 36, marginTop: 20 }}>Available balance: ${(this.state.availableBalance / 100).toFixed(2)}</h6>
										<h6 style={{ height: 36 }}>{`Paid Amount for ${this.state.selectedYear}-${this.state.selectedMonth}`} : ${(this.state.payoutStats.paid / 100).toFixed(2)}</h6>
										<h6 style={{ height: 36 }}>{`Due  Amount for ${this.state.selectedYear}-${this.state.selectedMonth}`} : ${(this.state.payoutStats.due / 100).toFixed(2)}</h6>
										<button
											type="button"
											className="btn btn-warning border-none"
											style={{ marginLeft: 10, minWidth: 152 }}
											disabled={this.state.payoutStats.due == 0 || this.state.availableBalance < this.state.payoutStats.due}
											onClick={this.handlePayMonth}
										>
											Pay for {`${this.state.selectedYear}-${this.state.selectedMonth}`}
										</button>
									</div>

									{/* {this.state.payoutStats.due_months && this.state.payoutStats.due_months.map(due_month => {
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
									})} */}

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
											columns={this.state.video_data_for_month.table_columns}
											dataSource={this.state.video_data_for_month.table_data}
											size='small'
											pagination={false}
										/>
									</div>

									<div className="col-md-12 mt-4">
										<h5>Apply data back to the owners</h5>
									</div>
									<div className="col-md-12">
										<Table
											bordered
											columns={this.state.video_parameters_for_month.table_columns}
											dataSource={this.state.video_parameters_for_month.table_data}
											size='small'
											pagination={false}
										/>
									</div>

									<div className="col-md-12 mt-4">
										<h5>Total minutes for each artist/owner</h5>
									</div>
									<div className="col-md-12">
										<Table
											bordered
											columns={this.state.minutes_for_artist.table_columns}
											dataSource={this.state.minutes_for_artist.table_data}
											size='small'
											pagination={false}
										/>
									</div>
								</div>

								<div className="row">
									<div className="col-md-12 mt-4">
										<h5>Profit Pool Calculation</h5>
									</div>
									<div className="col-md-12">
										<Table
											bordered
											columns={this.state.profit_pool.table_columns}
											dataSource={this.state.profit_pool.table_data}
											size='small'
											pagination={false}
										/>
									</div>
								</div>

								<div className="row">
									<div className="col-md-12 mt-4">
										<Table
											bordered
											columns={profit_pool_calc1_table_columns}
											dataSource={this.state.minutes_for_artist.table_data}
											size='small'
											pagination={false}
										/>
									</div>
								</div>

								<div className="row">
									<div className="col-md-12 mt-4">
										<Table
											bordered
											columns={profit_pool_calc2_table_columns}
											dataSource={this.state.minutes_for_artist.table_data}
											size='small'
											pagination={false}
										/>
									</div>
								</div>

								<div className="row">
									<div className="col-md-6 mt-4 mb-4">
										<Table
											bordered
											columns={last_table_columns}
											dataSource={this.state.last_table_data}
											size='small'
											pagination={false}
											showHeader={false}
										/>
									</div>
								</div>
							</div>
						</Spin>
					</div>
					{/* /.container-fluid */}
				</div>
			</Menu>
		)
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

