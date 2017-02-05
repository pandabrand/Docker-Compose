/*** @jsx React.DOM */
class OrderSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {searchValue:''};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({searchValue:event.target.value});
  }

  handleSubmit(event) {
    // event.preventDefault();
    // console.log(searchform);
    // document.searchform.submit();
  }

  render() {
    return <form name="searchform" action="/">
     <div className="mdl-textfield mdl-js-textfield">
       <input className="mdl-textfield__input" type="text" name="order_id" placeholder="12345..." pattern="-?[0-9]*(\.[0-9]+)?" id="orderSearchID" onChange={this.handleChange}/>
       {/* <label className="mdl-textfield__label" for="orderSearchID">Order...</label> */}
       <span className="mdl-textfield__error">Input is not a number!</span>
     </div>
     <input type="hidden" value="true" name="search" />
     <button className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" type="submit">Search</button>
   </form>

  }
}

ReactDOM.render(
  <OrderSearch />,
  document.getElementById('search-containerId')
);
