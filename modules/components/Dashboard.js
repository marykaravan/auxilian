import React from 'react'
import $ from 'jquery'
import { connect } from 'react-redux'
import Map from './Map'
import { mapThing, big } from '../styles.css'

class Dashboard extends React.Component {
  constructor(props) {
    super(props)
    this.addRequest = this.addRequest.bind(this)
    this.loadMap = this.loadMap.bind(this)
    this.state = { requests: [] }
  }

  componentDidMount() {
    $.ajax({
      url: '/api/requests',
      type: 'GET'
    }).done( requests => {
      this.setState({ requests: requests })
      this.loadMap()
    })
  }


  loadMap() {
    let mapboxgl = window.mapboxgl
    mapboxgl.accessToken = 'pk.eyJ1IjoibXZhc2lseWV2YSIsImEiOiJjaW51dnZobXIxMm5odWdseWVzanI4d2s1In0.RQNmugJct0lHOOlcFyCeRA'

    let map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [ -111.89, 40.7 ],
      zoom: 10
    }) 

    let userRequests = this.state.requests.filter( req => req.properties.userId === this.props.auth.id )
    let nonUserRequests = this.state.requests.filter( req => req.properties.userId !== this.props.auth.id )
     
    let userFeatures = userRequests.map( request => {
      return {

        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": request.geometry.coordinates
        },
        "properties": {
            "title": request.properties.title,
            "description": request.properties.description,
            "userId": request.properties.userId
           
        }
      }
    })

    let nonUserFeatures = nonUserRequests.map( request => {
      return {

        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": request.geometry.coordinates
        },
        "properties": {
            "title": request.properties.title,
            "description": request.properties.description,
            "userId": request.properties.userId
          
        }
      }
    })

    let userMarkers = {
      "type": "FeatureCollection",
      "features": userFeatures
    }

    let nonUserMarkers = {
      "type": "FeatureCollection",
      "features": nonUserFeatures
    }
    

    map.on('load', function () {

      map.addSource("userMarkers", {
        "type": "geojson",
        "data": userMarkers
      })

      map.addLayer({
        "id": "userMarkers",
        "type": "circle",
        "source": "userMarkers",
        "paint": {
          "circle-radius": 10,
          "circle-color": "#1976d2"
        }
      })

      map.addSource("nonUserMarkers", {
        "type": "geojson",
        "data": nonUserMarkers
      })

      map.addLayer({
        "id": "nonUserMarkers",
        "type": "circle",
        "source": "nonUserMarkers",
        "paint": {
          "circle-radius": 10,
          "circle-color": "#9575cd"
        }
        
      })


      map.addControl(new mapboxgl.Geocoder({ position: 'top-left' }))

    }) 

    map.on('click', function (e) {
        let features = map.queryRenderedFeatures(e.point, { layers: [ 'userMarkers', 'nonUserMarkers' ] })

        if (!features.length) {
            return
        } else {
          map.flyTo({ center: features[0].geometry.coordinates })
        }

        let feature = features[0]

        // Populate the popup and set its coordinates
        // based on the feature found.
        let popup = new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML(`
              ${feature.properties.title} <br />
              ${feature.properties.description} <br />
              <a href="#">${feature.properties.userId}</a>
            `)
            .addTo(map)

    })

    map.on('mousemove', function (e) {
        let features = map.queryRenderedFeatures(e.point, { layers: [ 'userMarkers', 'nonUserMarkers' ] })
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : ''
    })

  }

  getCoordinates(e) {
    e.preventDefault()
    var address = this.refs.coord.value
    $.ajax({
      url: '/api/mapbox?address=' + this.refs.coord.value,
      type: 'GET'
     }).done( response => {
      this.addRequest(this.props.auth.id, response.features[0].center)
      this.loadMap(response.features[0].center)
    })
  }

  addRequest(id, coords) {
    $.ajax({
      url: '/api/requests',
      type: 'POST',
      dataType: 'JSON',
      contentType: 'application/json',
      data: JSON.stringify({ 
        text: this.refs.text.value, 
        desc: this.refs.desc.value,
        coord: coords,
        id: id 
      })
    }).done( request => {
      this.setState({ requests: [ ...this.state.requests, request ] })
      console.log(request)
      this.refs.text.value = ''
      this.refs.desc.value = ''
      this.refs.coord.value = '' 
      this.loadMap()
    })
  }

  render() {
    const token = this.props.auth.token
    const id = this.props.auth.id
    let requests = this.state.requests.map( request => {
      return(<li key={request._id}>{`
        ${request.properties.title} : 
        ${request.properties.description} : 
        ${request.geometry.coordinates}
      `}</li>)
    })

  return (
    <div id={ big }>
      <div style={{ float: "right" }}>
        <form onSubmit={(e) => this.getCoordinates(e)}>
          <input ref="text" placeholder="Volunteer Event Title" />
          <input ref="desc" placeholder="Description of Event" />
          <input ref="coord" placeholder="Location of Event" />
          <button className="btn"type="submit">Add</button>
        </form>
        <ul style={{ float: "right" }}>
          {requests}
        </ul>
      </div>
      <div>
        <div id="map" className={mapThing}></div>
      </div> 
    </div>
   )
  }
}

const mapStateToProps = (state) => {
  return {
    auth: { token: state.auth.token, id: state.auth.id }
  }
}

export default connect(mapStateToProps)(Dashboard)
