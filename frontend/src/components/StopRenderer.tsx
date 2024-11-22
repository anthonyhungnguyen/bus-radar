import { RootState } from '@reduxjs/toolkit/query'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { useDispatch, useSelector } from 'react-redux'
import { GET_STOPS } from '../api/bus_api'
import { setLoading } from '../store/slices/appSlice'
import { setPickStop } from '../store/slices/busSlice'
import { AppDispatch } from '../store/store'
import { Stop } from '../types/type'
import StopSchedule from './StopSchedule'

const DefaultIcon = L.icon({
    iconUrl: '/circle.png',
    iconSize: [20, 20], // Size of the circle including the border (20px + 2px border on each side)
    iconAnchor: [12, 12], // Anchor to align the circle properly on the map
    popupAnchor: [0, -12], // Adjust popup location relative to the icon
})

const HighlightIcon = L.icon({
    iconUrl: '/highlight_circle.png', // Replace with an image to indicate the highlighted stop
    iconSize: [25, 25], // Slightly larger size for emphasis
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
})

const StopsRenderer = () => {
    const [stops, setStops] = useState<Stop[]>([])
    const { patternIDs, pickStop } = useSelector(
        (state: RootState) => state.bus
    )
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        if (!patternIDs) {
            return
        }
        GET_STOPS(patternIDs)
            .then((data) => {
                setStops(data)
            })
            .finally(() => {
                dispatch(setLoading(false))
            })
    }, [patternIDs, dispatch])

    return (
        <>
            {stops.map((stop) => (
                <Marker
                    key={stop.stopID}
                    position={[stop.latitude, stop.longitude]}
                    icon={
                        pickStop?.stopID === stop.stopID
                            ? HighlightIcon
                            : DefaultIcon
                    }
                    eventHandlers={{
                        click: () => {
                            dispatch(setPickStop(stop))
                        },
                    }}
                >
                    <Popup>
                        {/* <StopInfo stop={stop} /> */}
                        <StopSchedule />
                    </Popup>
                </Marker>
            ))}
        </>
    )
}

export default StopsRenderer
