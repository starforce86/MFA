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
// import 'antd/dist/antd.css';
import TextField from '@material-ui/core/TextField';

const log = logger('AdminAnalytics');
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
    query GetStats(
		$userId: String, $videoStatsBeginDate: DateTime!, $videoStatsEndDate: DateTime!, $videoStatsType: String!,
		$chargeStatsBeginDate: DateTime!, $chargeStatsEndDate: DateTime!, $chargeStatsType: String!
		$subscriptionStatsBeginDate: DateTime!, $subscriptionStatsEndDate: DateTime!, $subscriptionStatsType: String!
		$signupStatsBeginDate: DateTime!, $signupStatsEndDate: DateTime!, $signupStatsType: String!
		) {
		videoStats(
			userId: $userId
			beginDate: $videoStatsBeginDate
			endDate: $videoStatsEndDate
			type: $videoStatsType
		) {
			id
			title
			timespans {
				begin
				end
				userEventCount
				uniqueUserCount
				playSeconds
				realPlaySeconds
			}
		}
		artistStats(
			userId: $userId
			beginDate: $videoStatsBeginDate
			endDate: $videoStatsEndDate
		) {
			id
			fistname
			lastname
			username
			email
			viewCount
			playSeconds
			realPlaySeconds
		}
		chargeStats(
			beginDate: $chargeStatsBeginDate
			endDate: $chargeStatsEndDate
			type: $chargeStatsType
		) {
			begin
			end
			monthlyChargeCount
			monthlyChargeAmount
			yearlyChargeCount
			yearlyChargeAmount
			totalChargeCount
			totalChargeAmount
		}
		subscriptionStats(
			beginDate: $subscriptionStatsBeginDate
			endDate: $subscriptionStatsEndDate
			type: $subscriptionStatsType
		) {
			begin
			end
			monthlySubscriptionCount
			yearlySubscriptionCount
			totalSubscriptionCount
		}
		signupStats(
			beginDate: $signupStatsBeginDate
			endDate: $signupStatsEndDate
			type: $signupStatsType
		) {
			begin
			end
			signupCount
		}
    }
`;

const videoStatsTargets = [
	'user_event',
	'unique_users',
	'play_time',
	'real_play_time',
]
class AdminAnalytics extends Component {

	state = {
		videoStats: {
			beginDate: moment().subtract(moment.duration(1, 'months')).format(dateOnlyFormat),
			endDate: moment().format(dateOnlyFormat),
			type: 'daily',
			target: videoStatsTargets[0],
		},
		chargeStats: {
			beginDate: moment().subtract(moment.duration(12, 'months')).format(dateOnlyFormat),
			endDate: moment().format(dateOnlyFormat),
			type: 'monthly',
		},
		subscriptionStats: {
			beginDate: moment().subtract(moment.duration(12, 'months')).format(dateOnlyFormat),
			endDate: moment().format(dateOnlyFormat),
			type: 'monthly',
		},
		signupStats: {
			beginDate: moment().subtract(moment.duration(1, 'months')).format(dateOnlyFormat),
			endDate: moment().format(dateOnlyFormat),
			type: 'daily',
		}
	}

	constructor(props) {
		super(props);
	}

	handleVideoFromDateChange = (e) => {
		if(e.target.value < this.state.videoStats.endDate) {
			this.setState({
				videoStats: {
					...this.state.videoStats,
					beginDate: e.target.value
				}
			});
		}
	}

	handleVideoToDateChange = (e) => {
		if(e.target.value > this.state.videoStats.beginDate) {
			this.setState({
				videoStats: {
					...this.state.videoStats,
					endDate: e.target.value
				}
			});
		}
	}

	handleChargeFromDateChange = (e) => {
		if(e.target.value < this.state.chargeStats.endDate) {
			this.setState({
				chargeStats: {
					...this.state.chargeStats,
					beginDate: e.target.value
				}
			});
		}
	}

	handleChargeToDateChange = (e) => {
		if(e.target.value > this.state.chargeStats.beginDate) {
			this.setState({
				chargeStats: {
					...this.state.chargeStats,
					endDate: e.target.value
				}
			});
		}
	}

	handleSubscriptionFromDateChange = (e) => {
		if(e.target.value < this.state.subscriptionStats.endDate) {
			this.setState({
				subscriptionStats: {
					...this.state.subscriptionStats,
					beginDate: e.target.value
				}
			});
		}
	}

	handleSubscriptionToDateChange = (e) => {
		if(e.target.value > this.state.subscriptionStats.beginDate) {
			this.setState({
				subscriptionStats: {
					...this.state.subscriptionStats,
					endDate: e.target.value
				}
			});
		}
	}

	handleSignupFromDateChange = (e) => {
		if(e.target.value < this.state.signupStats.endDate) {
			this.setState({
				signupStats: {
					...this.state.signupStats,
					beginDate: e.target.value
				}
			});
		}
	}

	handleSignupToDateChange = (e) => {
		if(e.target.value > this.state.signupStats.beginDate) {
			this.setState({
				signupStats: {
					...this.state.signupStats,
					endDate: e.target.value
				}
			});
		}
	}

	handleVideoStatsTypeChange = (e) => {
		const type = e.target.value;
		if(type == 'daily') {
			this.setState({
				videoStats: {
					...this.state.videoStats, 
					type: type,
					beginDate: moment().subtract(moment.duration(1, 'months')).format(dateOnlyFormat),
					endDate: moment().format(dateOnlyFormat),
				}
			});
		} else if(type == 'monthly') {
			this.setState({
				videoStats: {
					...this.state.videoStats, 
					type: type,
					beginDate: moment().subtract(moment.duration(6, 'months')).format(dateOnlyFormat),
					endDate: moment().format(dateOnlyFormat),
				}
			});
		}
	}

	handleChargeStatsTypeChange = (e) => {
		const type = e.target.value;
		if(type == 'yearly') {
			this.setState({
				chargeStats: {
					...this.state.chargeStats, 
					type: type,
					beginDate: moment().subtract(moment.duration(10, 'years')).format(dateOnlyFormat),
					endDate: moment().format(dateOnlyFormat),
				}
			});
		} else if(type == 'monthly') {
			this.setState({
				chargeStats: {
					...this.state.chargeStats, 
					type: type,
					beginDate: moment().subtract(moment.duration(12, 'months')).format(dateOnlyFormat),
					endDate: moment().format(dateOnlyFormat),
				}
			});
		}
	}

	handleSubscriptionStatsTypeChange = (e) => {
		const type = e.target.value;
		if(type == 'yearly') {
			this.setState({
				subscriptionStats: {
					...this.state.subscriptionStats, 
					type: type,
					beginDate: moment().subtract(moment.duration(10, 'years')).format(dateOnlyFormat),
					endDate: moment().format(dateOnlyFormat),
				}
			});
		} else if(type == 'monthly') {
			this.setState({
				subscriptionStats: {
					...this.state.subscriptionStats, 
					type: type,
					beginDate: moment().subtract(moment.duration(12, 'months')).format(dateOnlyFormat),
					endDate: moment().format(dateOnlyFormat),
				}
			});
		}
	}

	handleSignupStatsTypeChange = (e) => {
		const type = e.target.value;
		if(type == 'daily') {
			this.setState({
				signupStats: {
					...this.state.signupStats, 
					type: type,
					beginDate: moment().subtract(moment.duration(1, 'months')).format(dateOnlyFormat),
					endDate: moment().format(dateOnlyFormat),
				}
			});
		} else if(type == 'monthly') {
			this.setState({
				signupStats: {
					...this.state.signupStats, 
					type: type,
					beginDate: moment().subtract(moment.duration(12, 'months')).format(dateOnlyFormat),
					endDate: moment().format(dateOnlyFormat),
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

		const { user } = this.props;
		const { videoStats, chargeStats, subscriptionStats, signupStats } = this.state;
		// console.log('############# request', videoStats.type)

		return <Query errorPolicy={"ignore"}
			fetchPolicy={"no-cache"}
			query={STATS_QUERY}
			variables={{
				userId: user.id,
				videoStatsBeginDate: videoStats.beginDate,
				videoStatsEndDate: videoStats.endDate,
				videoStatsType: videoStats.type,
				chargeStatsBeginDate: chargeStats.beginDate,
				chargeStatsEndDate: chargeStats.endDate,
				chargeStatsType: chargeStats.type,
				subscriptionStatsBeginDate: subscriptionStats.beginDate,
				subscriptionStatsEndDate: subscriptionStats.endDate,
				subscriptionStatsType: subscriptionStats.type,
				signupStatsBeginDate: signupStats.beginDate,
				signupStatsEndDate: signupStats.endDate,
				signupStatsType: signupStats.type,
			}}>
			{
				({ loading, error, data }) => {
					if (loading) return <div>Loading...</div>;
					if (error) return <div>Error</div>;
					console.log('############# response', data)

					const signup_line_data = {
						labels: [],
						datasets: []
					};
					let signup_table_columns = [
						{
							title: 'Type',
							dataIndex: 'type',
							key: 'type',
						},
						{
							title: 'Row Sum',
							dataIndex: 'sum',
							key: 'sum',
							sorter: (a, b) => a.sum - b.sum,
							defaultSortOrder: 'descend'
						}
					];
					let signup_table_data = [];
					if(data.signupStats && data.signupStats.length > 0) {
						for(let i=0; i<data.signupStats.length-1; i++) {
							const d = data.signupStats[i];
							if(this.state.signupStats.type == 'daily') {
								signup_table_columns.push({
									title: moment(d.begin).format(dateOnlyFormat),
									dataIndex: d.end,
									key: d.end,
								});
								signup_line_data.labels.push(moment(d.begin).format(dateOnlyFormat));
							} else if(this.state.signupStats.type == 'monthly') {
								signup_table_columns.push({
									title: moment(d.begin).format(monthOnlyFormat),
									dataIndex: d.end,
									key: d.end,
								});
								signup_line_data.labels.push(moment(d.begin).format(monthOnlyFormat));
							}
						}

						let val = {};
						for(let i=0; i<data.signupStats.length-1; i++) {
							const d = data.signupStats[i];
							val[d.end] = d.signupCount;
						}
						signup_table_data.push({
							type: "User Registration",
							sum: data.signupStats[data.signupStats.length-1].signupCount,
							...val
						});
					}
					// console.log('############### signup_table_columns signup_table_data', signup_table_columns, signup_table_data)
					
					signup_table_data.map((d,i) => {
						const dataset_data = [];
						for(let i=2; i<signup_table_columns.length; i++) {
							dataset_data.push(d[signup_table_columns[i].dataIndex]);
						}
						signup_line_data.datasets.push({
							label: `${d.type}`,
							fill: false,
							lineTension: 0.1,
							backgroundColor: `rgba(${line_colors[i]},0.4)`,
							borderColor: `rgba(${line_colors[i]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							pointBorderColor: `rgba(${line_colors[i]},1)`,
							pointBackgroundColor: '#fff',
							pointBorderWidth: 1,
							pointHoverRadius: 5,
							pointHoverBackgroundColor: `rgba(${line_colors[i]},1)`,
							pointHoverBorderColor: 'rgba(220,220,220,1)',
							pointHoverBorderWidth: 2,
							pointRadius: 1,
							pointHitRadius: 10,
							data: dataset_data
						});
					});
					// console.log('############### signup_line_data', signup_line_data)


					const subscription_line_data = {
						labels: [],
						datasets: []
					};
					let subscription_table_columns = [
						{
							title: 'Type',
							dataIndex: 'type',
							key: 'type',
						},
						{
							title: 'Row Sum',
							dataIndex: 'sum',
							key: 'sum',
							sorter: (a, b) => a.sum - b.sum,
							defaultSortOrder: 'descend'
						}
					];
					let subscription_table_data = [];
					if(data.subscriptionStats && data.subscriptionStats.length > 0) {
						for(let i=0; i<data.subscriptionStats.length-1; i++) {
							const d = data.subscriptionStats[i];
							if(this.state.subscriptionStats.type == 'monthly') {
								subscription_table_columns.push({
									title: moment(d.begin).format(monthOnlyFormat),
									dataIndex: d.end,
									key: d.end,
								});
								subscription_line_data.labels.push(moment(d.begin).format(monthOnlyFormat));
							} else if(this.state.subscriptionStats.type == 'yearly') {
								subscription_table_columns.push({
									title: moment(d.begin).format(yearOnlyFormat),
									dataIndex: d.end,
									key: d.end,
								});
								subscription_line_data.labels.push(moment(d.begin).format(yearOnlyFormat));
							}
						}

						let val = {};
						for(let i=0; i<data.subscriptionStats.length-1; i++) {
							const d = data.subscriptionStats[i];
							val[d.end] = d.monthlySubscriptionCount;
						}
						subscription_table_data.push({
							type: "Monthly",
							sum: data.subscriptionStats[data.subscriptionStats.length-1].monthlySubscriptionCount,
							...val
						});

						val = {};
						for(let i=0; i<data.subscriptionStats.length-1; i++) {
							const d = data.subscriptionStats[i];
							val[d.end] = d.yearlySubscriptionCount;
						}
						subscription_table_data.push({
							type: "Yearly",
							sum: data.subscriptionStats[data.subscriptionStats.length-1].yearlySubscriptionCount,
							...val
						});

						val = {};
						for(let i=0; i<data.subscriptionStats.length-1; i++) {
							const d = data.subscriptionStats[i];
							val[d.end] = d.totalSubscriptionCount;
						}
						subscription_table_data.push({
							type: "Total",
							sum: data.subscriptionStats[data.subscriptionStats.length-1].totalSubscriptionCount,
							...val
						});
					}
					// console.log('############### subscription_table_columns subscription_table_data', subscription_table_columns, subscription_table_data)
					
					subscription_table_data.sort((a, b) => (a.sum < b.sum) ? 1: -1);

					subscription_table_data.map((d,i) => {
						const dataset_data = [];
						for(let i=2; i<subscription_table_columns.length; i++) {
							dataset_data.push(d[subscription_table_columns[i].dataIndex]);
						}
						subscription_line_data.datasets.push({
							label: `${d.type}`,
							fill: false,
							lineTension: 0.1,
							backgroundColor: `rgba(${line_colors[i]},0.4)`,
							borderColor: `rgba(${line_colors[i]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							pointBorderColor: `rgba(${line_colors[i]},1)`,
							pointBackgroundColor: '#fff',
							pointBorderWidth: 1,
							pointHoverRadius: 5,
							pointHoverBackgroundColor: `rgba(${line_colors[i]},1)`,
							pointHoverBorderColor: 'rgba(220,220,220,1)',
							pointHoverBorderWidth: 2,
							pointRadius: 1,
							pointHitRadius: 10,
							data: dataset_data
						});
					});
					// console.log('############### charge_line_data', subscription_line_data)


					const charge_line_data = {
						labels: [],
						datasets: []
					};
					let charge_table_columns = [
						{
							title: 'Type',
							dataIndex: 'type',
							key: 'type',
						},
						{
							title: 'Row Sum',
							dataIndex: 'sum',
							key: 'sum',
							sorter: (a, b) => a.sum - b.sum,
							defaultSortOrder: 'descend'
						}
					];
					let charge_table_data = [];
					if(data.chargeStats && data.chargeStats.length > 0) {
						for(let i=0; i<data.chargeStats.length-1; i++) {
							const d = data.chargeStats[i];
							if(this.state.chargeStats.type == 'monthly') {
								charge_table_columns.push({
									title: moment(d.begin).format(monthOnlyFormat),
									dataIndex: d.end,
									key: d.end,
								});
								charge_line_data.labels.push(moment(d.begin).format(monthOnlyFormat));
							} else if(this.state.chargeStats.type == 'yearly') {
								charge_table_columns.push({
									title: moment(d.begin).format(yearOnlyFormat),
									dataIndex: d.end,
									key: d.end,
								});
								charge_line_data.labels.push(moment(d.begin).format(yearOnlyFormat));
							}
						}

						let val = {};
						for(let i=0; i<data.chargeStats.length-1; i++) {
							const d = data.chargeStats[i];
							val[d.end] = d.monthlyChargeAmount / 100;
						}
						charge_table_data.push({
							type: "Monthly",
							sum: data.chargeStats[data.chargeStats.length-1].monthlyChargeAmount / 100,
							...val
						});

						val = {};
						for(let i=0; i<data.chargeStats.length-1; i++) {
							const d = data.chargeStats[i];
							val[d.end] = d.yearlyChargeAmount / 100;
						}
						charge_table_data.push({
							type: "Yearly",
							sum: data.chargeStats[data.chargeStats.length-1].yearlyChargeAmount / 100,
							...val
						});

						val = {};
						for(let i=0; i<data.chargeStats.length-1; i++) {
							const d = data.chargeStats[i];
							val[d.end] = d.totalChargeAmount / 100;
						}
						charge_table_data.push({
							type: "Total",
							sum: data.chargeStats[data.chargeStats.length-1].totalChargeAmount / 100,
							...val
						});
					}
					// console.log('############### charge_table_columns charge_table_data', charge_table_columns, charge_table_data)
					
					charge_table_data.sort((a, b) => (a.sum < b.sum) ? 1: -1);

					charge_table_data.map((d,i) => {
						const dataset_data = [];
						for(let i=2; i<charge_table_columns.length; i++) {
							dataset_data.push(d[charge_table_columns[i].dataIndex]);
						}
						charge_line_data.datasets.push({
							label: `${d.type}`,
							fill: false,
							lineTension: 0.1,
							backgroundColor: `rgba(${line_colors[i]},0.4)`,
							borderColor: `rgba(${line_colors[i]},1)`,
							borderCapStyle: 'butt',
							borderDash: [],
							borderDashOffset: 0.0,
							borderJoinStyle: 'miter',
							pointBorderColor: `rgba(${line_colors[i]},1)`,
							pointBackgroundColor: '#fff',
							pointBorderWidth: 1,
							pointHoverRadius: 5,
							pointHoverBackgroundColor: `rgba(${line_colors[i]},1)`,
							pointHoverBorderColor: 'rgba(220,220,220,1)',
							pointHoverBorderWidth: 2,
							pointRadius: 1,
							pointHitRadius: 10,
							data: dataset_data
						});
					});
					// console.log('############### charge_line_data', charge_line_data)

					let charge_pie_data = {
						labels: [
							charge_table_data[1].type,
							charge_table_data[2].type,
						],
						datasets: [{
							data: [
								charge_table_data[1].sum,
								charge_table_data[2].sum,
							],
							backgroundColor: [
								`rgba(${line_colors[1]}, 0.8)`,
								`rgba(${line_colors[2]}, 0.8)`,
							],
							hoverBackgroundColor: [
								`rgba(${line_colors[1]}, 0.8)`,
								`rgba(${line_colors[2]}, 0.8)`,
							]
						}]
					};
					const video_bar_data = {
						labels: [],
						datasets: [
							{
								backgroundColor: 'rgba(255,206,86,0.6)',
								borderColor: 'rgba(255,206,86,1)',
								borderWidth: 1,
								hoverBackgroundColor: 'rgba(255,206,86,0.8)',
								hoverBorderColor: 'rgba(255,206,86,1)',
								data: []
							}
						]
					};
					let video_table_columns = [
						{
							title: 'Video',
							dataIndex: 'title',
							key: 'title',
							sorter: this.stringSorter('title')
						},
						{
							title: 'Row Sum',
							dataIndex: 'sum',
							key: 'sum',
							sorter: (a, b) => a.sum - b.sum,
							defaultSortOrder: 'descend'
						}
					];
					let video_table_data = [];
					if(data.videoStats && data.videoStats.length > 0) {
						for(let i=0; i<data.videoStats[0].timespans.length-1; i++) {
							const d = data.videoStats[0].timespans[i];
							if(this.state.videoStats.type == 'daily') {
								video_table_columns.push({
									title: moment(d.end).format(dateOnlyFormat),
									dataIndex: d.end,
									key: d.end,
								});
							} else if(this.state.videoStats.type == 'monthly') {
								video_table_columns.push({
									title: moment(d.begin).format(monthOnlyFormat),
									dataIndex: d.end,
									key: d.end,
								});
							}
						}

						data.videoStats.map(v => {
							let val = {};
							for(let i=0; i<v.timespans.length-1; i++) {
								const d = v.timespans[i];
								if(this.state.videoStats.target == videoStatsTargets[0]) {
									val[d.end] = d.userEventCount;
								} else if(this.state.videoStats.target == videoStatsTargets[1]) {
									val[d.end] = d.uniqueUserCount;
								} else if(this.state.videoStats.target == videoStatsTargets[2]) {
									val[d.end] = d.playSeconds;
								} else if(this.state.videoStats.target == videoStatsTargets[3]) {
									val[d.end] = d.realPlaySeconds;
								}
							}
							let sum = 0;
							if(this.state.videoStats.target == videoStatsTargets[0]) {
								sum = v.timespans[v.timespans.length-1].userEventCount;
							} else if(this.state.videoStats.target == videoStatsTargets[1]) {
								sum = v.timespans[v.timespans.length-1].uniqueUserCount;
							} else if(this.state.videoStats.target == videoStatsTargets[2]) {
								sum = v.timespans[v.timespans.length-1].playSeconds;
							} else if(this.state.videoStats.target == videoStatsTargets[3]) {
								sum = v.timespans[v.timespans.length-1].realPlaySeconds;
							}
							video_table_data.push({
								title: v.title,
								sum: sum,
								...val
							});
							
						});
					}
					// console.log('############### video_table_columns video_table_data', video_table_columns, video_table_data)
					
					video_table_data.sort((a, b) => (a.sum < b.sum) ? 1: -1);
					video_table_data.map(v => {
						video_bar_data.labels.push(v.title);
						video_bar_data.datasets[0].data.push(v.sum);
					});

					let artist_view_pie_data = {
						labels: data.artistStats.map(a => a.username),
						datasets: [{
							data: data.artistStats.map(a => a.viewCount),
							backgroundColor: [
								`rgba(${line_colors[1]}, 0.8)`,
								`rgba(${line_colors[2]}, 0.8)`,
							],
							hoverBackgroundColor: [
								`rgba(${line_colors[1]}, 0.8)`,
								`rgba(${line_colors[2]}, 0.8)`,
							]
						}]
					};

					let artist_playtime_pie_data = {
						labels: data.artistStats.map(a => a.username),
						datasets: [{
							data: data.artistStats.map(a => a.realPlaySeconds),
							backgroundColor: [
								`rgba(${line_colors[1]}, 0.8)`,
								`rgba(${line_colors[2]}, 0.8)`,
							],
							hoverBackgroundColor: [
								`rgba(${line_colors[1]}, 0.8)`,
								`rgba(${line_colors[2]}, 0.8)`,
							]
						}]
					};

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
													<h4>User Registration</h4>
												</div>
											</div>
											<div className="col-md-6 col-xs-12 m-auto">
												<Select
													value={this.state.signupStats.type}
													onChange={this.handleSignupStatsTypeChange}
													style={{ marginLeft: 100, color: 'white' }}
												>
													<MenuItem value={'daily'}>Daily</MenuItem>
													<MenuItem value={'monthly'}>Monthly</MenuItem>
												</Select>
											</div>
											<div className="col-md-2 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>from</span>
												<TextField
													type="date"
													defaultValue={this.state.signupStats.beginDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleSignupFromDateChange}
												/>
											</div>
											<div className="col-md-3 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>to</span>
												<TextField
													type="date"
													defaultValue={this.state.signupStats.endDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleSignupToDateChange}
												/>
											</div>
											<div className="col-md-12" style={{ marginTop: 20 }}>
												<Line
													data={signup_line_data}
													options={signup_line_options}
													// key={this.state.key}
													height={150}
													width={1024} />
											</div>
											<div className="col-md-12" style={{ marginTop: 30 }}>
												<Table
													columns={signup_table_columns}
													dataSource={signup_table_data}
													size='small'
													pagination={false}
												/>
											</div>
										</div>
										<div className="row" style={{ marginTop: 50 }}>
											<div className="col-md-12">
												<div className="main-title">
													<h4>Subscription</h4>
												</div>
											</div>
											<div className="col-md-6 col-xs-12 m-auto">
												<Select
													value={this.state.subscriptionStats.type}
													onChange={this.handleSubscriptionStatsTypeChange}
													style={{ marginLeft: 100, color: 'white' }}
												>
													<MenuItem value={'monthly'}>Monthly</MenuItem>
													<MenuItem value={'yearly'}>Yearly</MenuItem>
												</Select>
											</div>
											<div className="col-md-2 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>from</span>
												<TextField
													type="date"
													defaultValue={this.state.subscriptionStats.beginDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleSubscriptionFromDateChange}
												/>
											</div>
											<div className="col-md-3 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>to</span>
												<TextField
													type="date"
													defaultValue={this.state.subscriptionStats.endDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleSubscriptionToDateChange}
												/>
											</div>
											<div className="col-md-12" style={{ marginTop: 20 }}>
												<Line
													data={subscription_line_data}
													options={subscription_line_options}
													// key={this.state.key}
													height={150}
													width={1024} />
											</div>
											<div className="col-md-12" style={{ marginTop: 30 }}>
												<Table
													columns={subscription_table_columns}
													dataSource={subscription_table_data}
													size='small'
													pagination={false}
												/>
											</div>
										</div>
										<div className="row" style={{ marginTop: 50 }}>
											<div className="col-md-12">
												<div className="main-title">
													<h4>Charge</h4>
												</div>
											</div>
											<div className="col-md-6 col-xs-12 m-auto">
												<Select
													value={this.state.chargeStats.type}
													onChange={this.handleChargeStatsTypeChange}
													style={{ marginLeft: 100, color: 'white' }}
												>
													<MenuItem value={'monthly'}>Monthly</MenuItem>
													<MenuItem value={'yearly'}>Yearly</MenuItem>
												</Select>
											</div>
											<div className="col-md-2 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>from</span>
												<TextField
													type="date"
													defaultValue={this.state.chargeStats.beginDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleChargeFromDateChange}
												/>
											</div>
											<div className="col-md-3 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>to</span>
												<TextField
													type="date"
													defaultValue={this.state.chargeStats.endDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleChargeToDateChange}
												/>
											</div>
											<div className="col-md-9 col-xs-12" style={{ marginTop: 20 }}>
												<Line
													data={charge_line_data}
													options={charge_line_options}
													// key={this.state.key}
													height={200}
													width={1024} />
											</div>
											<div className="col-md-3 col-xs-12">
												<Pie
													data={charge_pie_data}
													options={{
														title: {
															display: true,
															text: `Charge Source Breakdown(${this.state.chargeStats.beginDate}-${this.state.chargeStats.endDate})`
														},
														legend: {
															display: true,
														},
														plugins: {
															datalabels: {
																anchor: 'center',
																display: true,
																color: 'white'
															}
														}
													}} />
											</div>
											<div className="col-md-12" style={{ marginTop: 30 }}>
												<Table
													columns={charge_table_columns}
													dataSource={charge_table_data}
													size='small'
													pagination={false}
												/>
											</div>
										</div>
										<div className="row" style={{ marginTop: 50 }}>
											<div className="col-md-12">
												<div className="main-title">
													<h4>Video</h4>
												</div>
											</div>
											<div className="col-md-6 col-xs-12 m-auto">
												<ButtonGroup
													variant="contained"
													color="secondary"
												>
													<Button onClick={() => this.setState({ videoStats: { ...this.state.videoStats, target: videoStatsTargets[0] } })}>User Event</Button>
													<Button onClick={() => this.setState({ videoStats: { ...this.state.videoStats, target: videoStatsTargets[1] } })}>Unique User</Button>
													<Button onClick={() => this.setState({ videoStats: { ...this.state.videoStats, target: videoStatsTargets[2] } })}>Play Time</Button>
													<Button onClick={() => this.setState({ videoStats: { ...this.state.videoStats, target: videoStatsTargets[3] } })}>Real Play Time</Button>
												</ButtonGroup>

												<Select
													value={this.state.videoStats.type}
													onChange={this.handleVideoStatsTypeChange}
													style={{ marginLeft: 100, color: 'white' }}
												>
													<MenuItem value={'daily'}>Daily</MenuItem>
													{/* <MenuItem value={'weekly'}>Weekly</MenuItem> */}
													<MenuItem value={'monthly'}>Monthly</MenuItem>
												</Select>
											</div>
											<div className="col-md-2 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>from</span>
												<TextField
													type="date"
													defaultValue={this.state.videoStats.beginDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleChargeFromDateChange}
												/>
											</div>
											<div className="col-md-3 col-xs-12 m-auto">
												<span style={{ color: 'white' }}>to</span>
												<TextField
													type="date"
													defaultValue={this.state.videoStats.endDate}
													style={{ marginLeft: 20, color: 'white' }}
													onChange={this.handleChargeToDateChange}
												/>
											</div>
											<div className="col-md-12" style={{ marginTop: 20 }}>
												<Bar data={video_bar_data}
													options={{
														maintainAspectRatio: false,
														title: {
															display: true,
															text: `Ranking of videos by ${this.state.videoStats.target}`
														},
														legend: {
															display: false,
														},
														plugins: {
															datalabels: {
																display: false,
															}
														}
													}}
													key={Math.random()}
													height={400}
													width={1024} />
											</div>
											<div className="col-md-6 col-xs-12" style={{ marginTop: 30 }}>
												<Pie
													data={artist_view_pie_data}
													options={{
														title: {
															display: true,
															text: `Views by artist(${this.state.videoStats.beginDate} ~ ${this.state.videoStats.endDate})`
														},
														legend: {
															display: true,
														},
														plugins: {
															datalabels: {
																anchor: 'center',
																display: true,
																color: 'white'
															}
														}
													}}
													height={400}
													width={1024} />
											</div>
											<div className="col-md-6 col-xs-12" style={{ marginTop: 30 }}>
												<Pie
													data={artist_playtime_pie_data}
													options={{
														title: {
															display: true,
															text: `Play time by artist(${this.state.videoStats.beginDate} ~ ${this.state.videoStats.endDate})`
														},
														legend: {
															display: true,
														},
														plugins: {
															datalabels: {
																anchor: 'center',
																display: true,
																color: 'white'
															}
														}
													}}
													height={400}
													width={1024} />
											</div>
											<div className="col-md-12" style={{ marginTop: 30 }}>
												<Table
													columns={video_table_columns}
													dataSource={video_table_data}
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

export default withApollo(AdminAnalytics);

