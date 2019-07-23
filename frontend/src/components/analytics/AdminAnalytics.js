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
import { Bar } from 'react-chartjs-2';
import logger from "../../util/logger";
import Menu from "../../components/menu";
// import 'antd/dist/antd.css';
import TextField from '@material-ui/core/TextField';

const log = logger('News');
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const dateOnlyFormat = 'YYYY-MM-DD';
const monthOnlyFormat = 'YYYY-MM';

const VIDEO_STATS_QUERY = gql`
    query GetVideoStats($userId: String, $beginDate: DateTime!, $endDate: DateTime!, $type: String!) {
			videoStats(
				userId: $userId
				beginDate: $beginDate
				endDate: $endDate
				type: $type
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
		}
	}

	constructor(props) {
		super(props);
	}

	handleRefresh = () => {
	}

	handleFromDateChange = (e) => {
		if(e.target.value < this.state.videoStats.endDate) {
			this.setState({
				videoStats: {
					...this.state.videoStats,
					beginDate: e.target.value
				}
			});
		}
	}

	handleToDateChange = (e) => {
		if(e.target.value > this.state.videoStats.beginDate) {
			this.setState({
				videoStats: {
					...this.state.videoStats,
					endDate: e.target.value
				}
			});
		}
	}

	handleTypeChange = (e) => {
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

	stringSorter = (key) => (a, b) => {
		if(a[key] < b[key]) { return -1; }
    if(a[key] > b[key]) { return 1; }
    return 0;
	}

	render() {

		const { user } = this.props;
		const { videoStats } = this.state;
		console.log('############# request', videoStats.type)

		return <Query errorPolicy={"ignore"}
			fetchPolicy={"no-cache"}
			query={VIDEO_STATS_QUERY}
			variables={{
				userId: user.id,
				beginDate: videoStats.beginDate,
				endDate: videoStats.endDate,
				type: videoStats.type
			}}>
			{
				({ loading, error, data }) => {
					if (loading) return <div>Loading...</div>;
					if (error) return <div>Error</div>;
					console.log('############# response', data)

					const video_pie_data = {
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
					let columns = [
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
					let table_data = [];
					if(data.videoStats && data.videoStats.length > 0) {
						for(let i=0; i<data.videoStats[0].timespans.length-1; i++) {
							const d = data.videoStats[0].timespans[i];
							if(this.state.videoStats.type == 'daily') {
								columns.push({
									title: moment(d.end).format(dateOnlyFormat),
									dataIndex: d.end,
									key: d.end,
								});
							} else if(this.state.videoStats.type == 'monthly') {
								columns.push({
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
							table_data.push({
								title: v.title,
								sum: sum,
								...val
							});
							
						});
					}
					console.log('###############', columns, table_data)
					
					table_data.sort((a, b) => (a.sum < b.sum) ? 1: -1);
					table_data.map(v => {
						video_pie_data.labels.push(v.title);
						video_pie_data.datasets[0].data.push(v.sum);
					})

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
													<h6>Admin Analytics</h6>
												</div>
											</div>
											<div className="col-md-6 col-xs-12 m-auto">
												<ButtonGroup
													variant="contained"
													color="secondary"
												>
													<Button onClick={() => this.setState({videoStats: {...this.state.videoStats, target: videoStatsTargets[0]}})}>User Event</Button>
													<Button onClick={() => this.setState({videoStats: {...this.state.videoStats, target: videoStatsTargets[1]}})}>Unique User</Button>
													<Button onClick={() => this.setState({videoStats: {...this.state.videoStats, target: videoStatsTargets[2]}})}>Play Time</Button>
													<Button onClick={() => this.setState({videoStats: {...this.state.videoStats, target: videoStatsTargets[3]}})}>Real Play Time</Button>
												</ButtonGroup>

												<Select
													value={this.state.videoStats.type}
													onChange={this.handleTypeChange}
													style={{marginLeft: 100, color: 'white'}}
												>
													<MenuItem value={'daily'}>Daily</MenuItem>
													{/* <MenuItem value={'weekly'}>Weekly</MenuItem> */}
													<MenuItem value={'monthly'}>Monthly</MenuItem>
												</Select>
											</div>
											<div className="col-md-2 col-xs-12 m-auto">
												<span style={{color: 'white'}}>from</span>
												<TextField
													type="date"
													defaultValue={this.state.videoStats.beginDate}
													style={{marginLeft: 20, color: 'white'}}
													onChange={this.handleFromDateChange}
												/>
											</div>
											<div className="col-md-3 col-xs-12 m-auto">
												<span style={{color: 'white'}}>to</span>
												<TextField
													type="date"
													defaultValue={this.state.videoStats.endDate}
													style={{marginLeft: 20, color: 'white'}}
													onChange={this.handleToDateChange}
												/>
											</div>
											<div className="col-md-12" style={{marginTop: 20}}>
												<Bar data={video_pie_data}
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
													height={300}
													width={1024} />
											</div>
											<div className="col-md-12">
												<Table
													columns={columns}
													dataSource={table_data}
													size='small'
													pagination = {false}
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

