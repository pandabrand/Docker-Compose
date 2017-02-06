  /*** @jsx React.DOM */
class OrderRow extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let material_date = new Date(this.props.order.materials_close_date).toLocaleDateString('en-US', options);
    let file_uri = this.props.order.hi_res_path;

    return <tr>
      <td>{this.props.order.pk_id}</td>
      <td className="mdl-data-table__cell--non-numeric">{this.props.order.creator ? this.props.order.creator.username : ''}</td>
      <td className="mdl-data-table__cell--non-numeric">{material_date}</td>
      <td className="mdl-data-table__cell--non-numeric">{this.props.order.status.name_for_display}</td>
      <td className="mdl-data-table__cell--non-numeric">{this.props.order.template.headline ? this.props.order.template.headline.code : ''}</td>
      <td className="mdl-data-table__cell--non-numeric"><a href={'/arf/'+this.props.order.pk_id} target="_blank"><i className="material-icons">description</i></a></td>
      <td className="mdl-data-table__cell--non-numeric">
        {file_uri ?
          <a href={file_uri}><i className="material-icons">insert_drive_file</i></a>
          :
          <i className="material-icons">close</i>
        }

      </td>
    </tr>
  }
}

class OrdersPage extends React.Component {
    constructor(props) {
      super(props)
      this.state={pageItems:null, db_class:'Order', db_col:'pk_id', asc: true}
      this.handleClick = this.handleClick.bind(this);
      this.buildUrl = this.buildUrl.bind(this);
      this.callQuery = this.callQuery.bind(this);
    }

    componentDidMount() {
      this.callQuery();
    }

    handleClick(db_class, db_col) {
      event.preventDefault();
      let new_direction = !this.state.asc;
      this.setState({db_class:db_class, db_col:db_col, asc: new_direction});
    }

    callQuery() {
      let path = window.location.pathname == '/' ? '' : window.location.pathname;
      let query_string = window.location.search.slice(1);
      let request_url = this.props.api_path+path+'?'+query_string;
      let request = new XMLHttpRequest();
      request.onreadystatechange = (e) => {
        if (request.readyState !== 4) {
          return;
        }

        if (request.status === 200) {
          let json_req = JSON.parse(request.response)
          this.setState({pageItems:json_req});
        } else {
          console.warn('error');
        }
      };
      request.open('GET', request_url);
      request.send();
    }

    buildUrl() {
      let request_url = (this.state.pageItems && this.state.pageItems.page) > 1 ? this.props.api_path+'/'+page_num : this.props.api_path;
      let query_string = '?sort='+this.state.db_class+'&col='+this.state.db_col+'&direction='+this.getAllUrlParams().direction
      return request_url+query_string;
    }

    buildLink(path) {
      let pathname = path == '1' ? '' : path;
      let params = window.location.search.slice(1).length > 0 ? '?'+window.location.search.slice(1) : window.location.search.slice(1);
      let request_url = path+params;
      return '/'+request_url;
    }

    getAllUrlParams(url) {

      // get query string from url (optional) or window
      var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

      // we'll store the parameters here
      var obj = {};

      // if query string exists
      if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i=0; i<arr.length; i++) {
          // separate the keys and the values
          var a = arr[i].split('=');

          // in case params look like: list[]=thing1&list[]=thing2
          var paramNum = undefined;
          var paramName = a[0].replace(/\[\d*\]/, function(v) {
            paramNum = v.slice(1,-1);
            return '';
          });

          // set parameter value (use 'true' if empty)
          var paramValue = typeof(a[1])==='undefined' ? true : a[1];

          // (optional) keep case consistent
          paramName = paramName.toLowerCase();
          paramValue = paramValue.toLowerCase();

          // if parameter name already exists
          if (obj[paramName]) {
            // convert value to array (if still string)
            if (typeof obj[paramName] === 'string') {
              obj[paramName] = [obj[paramName]];
            }
            // if no array index number specified...
            if (typeof paramNum === 'undefined') {
              // put the value on the end of the array
              obj[paramName].push(paramValue);
            }
            // if array index number specified...
            else {
              // put the value at that index number
              obj[paramName][paramNum] = paramValue;
            }
          }
          // if param name doesn't exist yet, set it
          else {
            obj[paramName] = paramValue;
          }
        }
      }

      return obj;
    }

    buildLinkSort() {
      let _dir = this.getAllUrlParams().direction;
      let dir = !(_dir == 'asc') ? 'asc' : 'desc';
      return '/'+this.state.pageItems.paginate.page+'?sort='+this.state.db_class+'&col='+this.state.db_col+'&direction='+dir
    }

    render() {
      return <div className="demo-charts mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--12-col mdl-grid">
        { this.state.pageItems ?
          <div>
          <div className="mdl-paging">
            <span className="mdl-paging__per-page"><span className="mdl-paging__per-page-label">Results per page:</span><span className="mdl-paging__per-page-value">{this.state.pageItems.paginate.per_page}</span></span>
            {this.state.pageItems.paginate.has_prev ? <a id="prev-page" href={this.buildLink(this.state.pageItems.paginate.prev_num)} className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon mdl-paging__prev"><i className="material-icons">keyboard_arrow_left</i></a> : ''}
           <span className="mdl-paging__count">{this.state.pageItems.paginate.page} de {this.state.pageItems.paginate.pages}</span>
             {this.state.pageItems.paginate.has_next ? <a id="next-page" href={this.buildLink(this.state.pageItems.paginate.next_num)} className="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon mdl-paging__next"><i className="material-icons">keyboard_arrow_right</i></a> : ''}
          </div>
          <table className="mdl-data-table mdl-js-data-table">
            <thead>
              <tr>
                <th className="mdl-data-table__cell--non-numeric"><a href={this.buildLinkSort()}>Order Number</a></th>
                <th className="mdl-data-table__cell--non-numeric">Creator</th>
                <th className="mdl-data-table__cell--non-numeric">Close Date</th>
                <th className="mdl-data-table__cell--non-numeric">Status</th>
                <th className="mdl-data-table__cell--non-numeric">Ad Code</th>
                <th className="mdl-data-table__cell--non-numeric">ARF</th>
                <th className="mdl-data-table__cell--non-numeric">File</th>
              </tr>
            </thead>
            <tbody>
              {this.state.pageItems.orders.map((order, i) => {
                return <OrderRow key={i} order={order} />
              })}
            </tbody>
          </table>
        </div>
          :<div>Loading</div>
        }
      </div>
      ;
    }
}

  OrdersPage.defaultProps = {api_path:'/api'};

  ReactDOM.render(
    <OrdersPage />,
    document.getElementById('content')
  );
