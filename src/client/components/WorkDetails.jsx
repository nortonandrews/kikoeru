import { Link } from 'inferno-router';

// Renders the tag links.
const Tags = props => props.tags.map(
  (tag, index, tags) => (
    <>
      <Link to={`/tag/${tag.id}`} className="uk-link-muted">{tag.name}</Link>
      {index !== tags.length - 1 ? ', ' : ''}
    </>
  ),
);

// Renders the VA badges.
const VAs = props => props.vas.map(
  va => (
    <Link
      to={`/va/${va.id}`}
      className="uk-label uk-label-success k-label-link"
    >
      {va.name}
    </Link>
  ),
);

// Renders the work metadata.
export default ({ metadata }) => (
  <div>
    <div className="uk-cover-container">
      <Link to={`/work/${metadata.id}`}>
        <img src={`/api/cover/${metadata.id}`} alt="Cover" />
      </Link>
    </div>

    <div className="uk-padding-small uk-margin-remove-bottom">
      <h3 className="uk-margin-remove-bottom">
        <Link
          to={`/work/${metadata.id}`}
          className="uk-link-heading"
        >
          {metadata.title}
        </Link>
      </h3>

      <Link
        to={`/circle/${metadata.circle.id}`}
        className="uk-link uk-link-muted uk-margin-remove-top"
      >
        {metadata.circle.name}
      </Link>

      <div className="uk-margin-top">
        <p><Tags tags={metadata.tags} /></p>
      </div>

      <div className="uk-margin-top">
        <VAs vas={metadata.vas} />
      </div>
    </div>
  </div>
);
