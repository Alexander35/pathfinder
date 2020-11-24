import React from 'react';
import { connect } from "react-redux"
import { Line } from 'react-lineto';
import GetAllPoints from "../../app/requests/GetAllPoints";
import GetAllRouts from "../../app/requests/GetAllRouts";
import AddRoute from "../../app/requests/AddRoute";
import GetReport from "../../app/requests/GetReport";

class RouteMap extends React.Component {

  constructor(props) {
      super(props);
      this.state = {
        all_points: [],
        all_routs: [],

        route_name: '',
        route_start_p: '',
        route_end_p: '',
        report: {}
      };
  }

  refresh() {
    GetAllPoints().then( res => {
        this.setState({all_points: res});
    });

    GetAllRouts().then( res => {
        this.setState({all_routs: res});
    });

    GetReport().then( res => {
        console.log('res', res)
        this.setState({report: res});
    });
  }

  componentDidMount() {
    this.refresh()
  }

  onChange = (e) => {
      this.setState({ [e.target.name]: e.target.value });
  }

  addNewRoute() {
    AddRoute(
        this.state.route_name,
        this.state.route_start_p,
        this.state.route_end_p,
        this.props.auth_user,
        this.props.auth_token
    ).then( res => {
        this.refresh()
    });
  }

  getPointNamesDropdown () {
    let menu = []
    this.state.all_points.map((p, i) => {
      menu.push(<option key={p.Name} name={p.Name} value={p.Name}>{p.Name}</option>)
    })
    return ( menu )
  }

  makeReport () {

    const  makeUserReport = (username) => {
        return(
            Object.keys(this.state.report[username]).map( (key)=> {
              return (
                <li class="list-group-item">{key} : {this.state.report[username][key]}</li>
                )
            })
         )
    }

   return(
      Object.keys(this.state.report).map( (username)=> {
        return (
          <ul class="list-group">
            <li class="list-group-item">{username}</li>
            {makeUserReport(username)}
          </ul>
          )
      })
   )
  }

  onChangeStartPoint = (e) => {
    this.setState({route_start_p: e.target.value})
  }

  onChangeEndPoint = (e) => {
    this.setState({route_end_p: e.target.value})
  }

  addNewRouteForm() {
    return (
      <>
          <div className="form-row">
            <div className="form-group col-md-3">
              <label>Route Name</label>
              <input name="route_name" value={this.state.route_name} placeholder="Route Name" onChange={this.onChange} />
            </div>
          
            <div className="form-group col-md-3">
              <label>Start point</label>
              <select className="custom-select" onChange={this.onChangeStartPoint.bind(this)}>
                <option selected>{this.state.route_start_p}</option>
                {this.getPointNamesDropdown()}
              </select>
            </div>
          
            <div className="form-group col-md-3">
              <label>End point</label>
              <select className="custom-select" onChange={this.onChangeEndPoint.bind(this)}>
                <option selected>{this.state.route_end_p}</option>
                {this.getPointNamesDropdown()}
              </select>
            </div>
          
            <div className="form-group col-md-3">
              <button className="btn btn-primary" onClick={this.addNewRoute.bind(this)}>
                  Add new Route
              </button>
            </div>
          </div>
      </>
    )
  }

  drawAllRouts() {
    let routs = []

    this.state.all_routs.map( (r, i) => {

      let color = ''

      switch(r.Owner) {
        case 1:
          color = 'red';
          break;
        case 2:
          color = 'pink';
          break;
        case 3:
          color = 'green';
          break;
        case 4:
          color = 'purple';
          break;
        case 5:
          color = 'bar';
          break;
        case 6:
          color = 'cyan';
          break;
        default:
          color = 'black';
      }

      for (let ind=0; ind < (r.Order['point_list_x'].length -1); ind++) {
        routs.push(<Line key={i+'|'+ind}
            borderColor={color}
            x0={r.Order['point_list_x'][ind]*5}
            y0={r.Order['point_list_y'][ind]*3.1}
            x1={r.Order['point_list_x'][ind+1]*5}
            y1={r.Order['point_list_y'][ind+1]*3.1}
          />)
      } 
    })

    return( routs )
  }

  drawPoint(x, y, index, color="black") {
    return (
      <div key={index}> 
        <Line borderColor={color} x0={x} y0={y} x1={x-2} y1={y-2} />
        <Line borderColor={color} x0={x-2} y0={y-2} x1={x} y1={y-2} />
        <Line borderColor={color} x0={x} y0={y-2} x1={x} y1={y} />
      </div>
    )
  }

  drawAllPoints() {
    let points = []

    this.state.all_points.map( (p, i) => {
      points.push(this.drawPoint(p.X*5, p.Y*3.1, i))
    })

    return( points )
  }

  render() {
      return (
        <>
          <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Report</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  {this.makeReport()}
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="row">

              <div className="col-md-2">
                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
                  Show report
                </button>
              </div>
              <div className="col-md-10">
                {this.addNewRouteForm()}
              </div>
            </div>
         

            <div className="row">
              {this.drawAllPoints()}
            </div>
            <div className="row">
              {this.drawAllRouts()}
            </div>
          </div>
        </>
      );
  }
}

const mapStateToProps = state => {
    return { auth_user: state.user.login,
             auth_token: state.auth.token };
};

export default connect(
    mapStateToProps
)(RouteMap);