import React, { Component } from 'react'
import { login, signUp } from './actions'
import { connect } from 'react-redux'
import $ from 'jquery'

class Login extends Component {
  constructor(props) {
    super(props)
    this.signUp = this.signUp.bind(this)
    this.signIn = this.signIn.bind(this)
    this.validateEmail = this.validateEmail.bind(this)
    const redirectLocation = '/dashboard'
    this.state = { error: false, redirectRoute: redirectLocation, signInShow: false, signUpShow: false, errors: false }
  }
  componentDidMount() {
    $('#up').click( function () {
      $('#su').toggle('show')
    }),
    $('#in').click( function () {
      $('#si').toggle('show')
    })
  }

  signUp(event) {
    event.preventDefault()
    this.validateEmail()
    debugger
    if (!this.state.errors) {
      const email = this.refs.newEmail.value
      const pass = this.refs.newPass.value
      this.props.dispatch(signUp(email, pass, this.state.redirectRoute, this.props.history))
    }
    this.refs.signUpForm.reset()
  }

  signIn(event) {
    event.preventDefault()

    const email = this.refs.email.value
    const pass = this.refs.pass.value
    this.props.dispatch(login(email, pass, this.state.redirectRoute, this.props.history))
    this.refs.signInForm.reset()
  }

  validateEmail() {
    let error = this.state.errors ? <p style={{ color: 'red' }}>{this.state.errors}</p> : null
    let email = this.refs.newEmail.value
    let regex = /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)[\\.]([a-zA-Z]{2,9})$/
    if (!regex.test(email)) {
      this.setState({ errors: "Error: Use valid email example@example.com" })
    } else {
      this.setState({ errors: false })
    }
  }

  render() {

    return (
      <div className="container">
      <div className="row">
        <div className="col s12 m6 center">
          <h2 className="btn-large" id="up">Sign Up</h2>
          <form id="su" style={{ display: 'none' }} ref="signUpForm" onSubmit={this.signUp}>
            <input type="text" ref="newEmail" placeholder="email" />
            <input type="password" ref="newPass" placeholder="password"/>
            <br />
            <button className="btn" type="submit">sign up</button>
          </form>
        </div>
        <div className="col s12 m6 center">
          <h2 className="btn-large" id="in">Sign In</h2>
          <form id="si" style={{ display: 'none' }} ref="signInForm" onSubmit={this.signIn}>
            <input type="text" ref="email" placeholder="email" />
            <input type="password" ref="pass" placeholder="password" />
            <br />
            <button className="btn" type="submit">login</button>
          </form>
        </div>
      </div>
      </div>
    )
  }
}

export default connect()(Login)
