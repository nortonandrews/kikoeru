import { Component } from 'inferno';
import { Link } from 'inferno-router';

/**
 * Generic link list (used for circles, tags and VAs).
 */
class List extends Component {
  constructor(props) {
    super(props);

    this.onFilter = this.onFilter.bind(this);
    this.state = {
      items: null,
      filteredItems: null,
    };
  }

  componentDidMount() {
    const { restrict } = this.props;

    fetch(`/api/${restrict}s/`)
      .then((res) => res.json())
      .then((res) => this.setState({
        items: res,
      }))
      .catch((err) => {
        throw new Error(`Failed to fetch /api/${restrict}s/: ${err}`);
      });
  }

  onFilter(evt) {
    evt.preventDefault();
    const data = new FormData(evt.target);
    const { items } = this.state;

    this.setState({
      items,
      filteredItems: items.filter((x) => x.name.toLowerCase().indexOf(data.get('filter_str').toLowerCase()) !== -1),
    });
  }

  render() {
    const { restrict } = this.props;
    const { items, filteredItems } = this.state;

    if (!items) {
      return (
        <div className="uk-cover-container" uk-height-viewport>
          <div className="uk-position-center" uk-spinner="ratio: 2" />
        </div>
      );
    }

    const visibleItems = filteredItems || items;
    const elementList = visibleItems.map((item) => (
      <Link
        to={`/${restrict}/${item.id}`}
        className="uk-button uk-button-default uk-width-1 uk-margin-small-bottom"
      >
        {item.name}
      </Link>
    ));

    return (
      <div className="uk-container">
        <h2 className="uk-margin-top">
          All
          {restrict}
          s
        </h2>
        <form onSubmit={this.onFilter}>
          <input name="filter_str" className="uk-input uk-width-1" type="text" placeholder={`Search for a ${restrict}...`} />
        </form>
        <div className="uk-align-center">
          {elementList}
        </div>
      </div>
    );
  }
}

export default List;
