import React from 'react';
import {
	gql,
	useMutation,
	useReactiveVar,
	Reference
} from '@apollo/client';

import { GET_LAUNCH_DETAILS } from '../pages/launch';
import Button from '../components/button';
import { cartItemsVar } from '../cache';
import * as LaunchDetailsTypes from '../pages/__generated__/LaunchDetails';

export { GET_LAUNCH_DETAILS };

export const CANCEL_TRIP = gql `
	mutation cancel($launchId: ID!) {
		cancelTrip(launchId: $launchId) {
			success
			message
			launches {
				id
				isBooked
			}
		}
	}
`;

interface ActionButtonProps extends Partial<LaunchDetailsTypes.LaunchDetails_launch> {}

// CancelTripButton is displayed only for trips that the user has already booked
const CancelTripButton: React.FC<ActionButtonProps> = ({ id }) => {
	const [mutate, { loading, error }] =  useMutation(
		CANCEL_TRIP,
		{
			variables: { launchId: id },
			update(cache, { data: { cancelTrip } }) {
				// Update the user's caches list of trips
				// to remove the trip that was just canceled
				const launch = cancelTrip.launches[0];
				cache.modify({
					id: cache.identify({
						__typename: 'User',
						id: localStorage.getItem('userId'),
					}),
					fields: {
						trips(existingTrips: Reference[], { readField }) {
							return existingTrips.filter(
								tripRef => readField("id", tripRef) !== launch.id
							);
						}
					}
				});
			}
		}
	);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error</p>;

	return (
		<div>
			<Button
				onClick={() => mutate()}
				data-testid={'action-button'}
			>
				Cancel This Trip
			</Button>
		</div>
	);
}

// ToggleTripButton enables the user to add/remove a trip from their cart
const ToggleTripButton: React.FC<ActionButtonProps> = ({ id }) => {
	const cartItems = useReactiveVar(cartItemsVar);
	const isInCart = id ? cartItems.includes(id) : false;
	return (
		<div>
			<Button
				onClick={() => {
					if (id) {
						cartItemsVar(
							isInCart
								? cartItems.filter(itemId => itemId !== id)
								: [...cartItems, id]
						);
					}
				}}
				data-testid={'action-button'}
			>
				{isInCart ? 'Remove from cart' : 'Add to cart'}
			</Button>
		</div>
	);
}

const ActionButton: React.FC<ActionButtonProps> = ({ isBooked, id}) => (
	isBooked ? <CancelTripButton id={id} /> : <ToggleTripButton id={id} />
);

export default ActionButton;