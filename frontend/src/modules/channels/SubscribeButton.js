import {Mutation} from "react-apollo";
import gql from "graphql-tag";
import {withUser} from "../../util/auth";
import {withRouter} from 'next/router'

const unsubscribeToUser = gql`
    mutation unsubscribeToUser($myId: ID!, $publisherId: ID!) {
        updateUser(
            where: { id: $myId }
            data: { my_subscription_users: { disconnect: { id: $publisherId } } }
        ) {
            id
            my_subscription_users {
                id
            }
        }
    }
`;
const subscribeToUser = gql`
    mutation subscribeToUser($myId: ID!, $publisherId: ID!) {
        updateUser(
            where: { id: $myId }
            data: { my_subscription_users: { connect: { id: $publisherId } } }
        ) {
            id
            my_subscription_users {
                id
            }
        }
    }
`;

const subscribe = ({artist, user, router}) => {
	if (user) {
		const isSubscribed =
			user ? user.my_subscription_users.findIndex(item => item.id === artist.id) >= 0 : null;
		return (
			<Mutation
				mutation={isSubscribed ? unsubscribeToUser : subscribeToUser}
				variables={{myId: user.id, publisherId: artist.id}}
			>
				{(submitMutation, {loading, error}) => (
					<div className="channels-card-image-btn">
						<button
							onClick={submitMutation}
							type="button"
							className={
								isSubscribed
									? "btn btn-outline-secondary btn-sm"
									: "btn btn-outline-danger btn-sm"
							}
						>
							{loading ? "..." : isSubscribed ? "Following" : "Follow"}
							{/*<strong>*/}
							{/*    {artist.subscribed_users_count*/}
							{/*        ? intToString(artist.subscribed_users_count)*/}
							{/*        : ""}*/}
							{/*</strong>*/}
						</button>
					</div>
				)}
			</Mutation>
		);
	}
	return (
		<div className="channels-card-image-btn">
			<button type="button" className={"btn btn-outline-danger btn-sm"} onClick={_ => router.push('/login')}>
				Follow
				<strong/>
			</button>
		</div>
	);
};
const Button = ({artist, user}) => {
	//   console.log(user);
	return <subscribe artist={artist}/>;
};


export default withRouter(withUser(subscribe));
