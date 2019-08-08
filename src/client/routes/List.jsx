import { Component } from 'inferno';
import { Link } from 'inferno-router';

/**
 * Generic link list (used for circles, tags and VAs).
 */
class List extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: null,
    };
  }

  componentDidMount() {
    const { restrict } = this.props;

    fetch(`/api/${restrict}s/`)
      .then(res => res.json())
      .then(res => this.setState({
        items: res,
      }))
      .catch((err) => {
        throw new Error(`Failed to fetch /api/${restrict}s/: ${err}`);
      });
  }

  render() {
    const { restrict } = this.props;
    const { items } = this.state;

    if (!items) {
      return (
        <div className="uk-cover-container" uk-height-viewport>
          <div className="uk-position-center" uk-spinner="ratio: 2" />
        </div>
      );
    }

    const elementList = items.map(item => (
      <Link
        to={`/${restrict}/${item.id}`}
        className="uk-button uk-button-default uk-width-1 uk-margin-small-bottom"
      >
        {item.name}
      </Link>
    ));

    return (
      <div className="uk-container">
        <h2 className="uk-margin-top">All {restrict}s</h2>
        <div className="uk-align-center">
          {elementList}
        </div>
      </div>
    );
  }
}

export default List;
