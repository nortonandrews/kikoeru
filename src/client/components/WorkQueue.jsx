import { Component } from 'inferno';
import { connect } from 'inferno-redux';

import UIkit from 'uikit';

const mapStateToProps = state => ({
  // Track hash if currently playing a track, else null.
  currentlyPlayingHash: (state.playing && state.queue[state.queueIndex])
    ? state.queue[state.queueIndex].hash : null,
});

// Renders a single row (track) inside the list.
const FileTableRow = ({
  clickHandler, file, index, fileOptions, usePauseIcon,
}) => (
  <tr>
    <td><button type="button" uk-icon={`icon: ${usePauseIcon ? 'refresh' : 'play-circle'}`} className={`uk-button k-button-icon ${usePauseIcon ? 'k-button-active' : ''}`} onClick={evt => clickHandler(evt, index)} /></td>
    <td>
      {file.title}
      <p className="uk-text-meta uk-margin-remove-top">{file.subtitle}</p>
    </td>
    <td>
      <button type="button" uk-icon="icon: more-vertical" className="uk-button k-button-icon" />
      <div uk-dropdown="delay-hide: 0, animation: uk-animation-slide-top-small; pos: bottom-left; mode: click; boundary: #root">
        <ul className="uk-list uk-list-divider  uk-margin-remove-bottom">
          {fileOptions.map(option => <li><button type="button" className="uk-button uk-button-text" onClick={(evt) => { clickHandler(evt, { type: option.type, index }); }}>{option.text}</button></li>)}
        </ul>
      </div>
    </td>
  </tr>
);

// Card containing the track list.
class WorkQueue extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(evt, payload) {
    const { dispatch, queue } = this.props;

    if (typeof payload === 'number') {
      // Clicked play on a single track. Add all files to queue and play the one
      // we clicked on.
      dispatch({
        type: 'SET_QUEUE',
        payload: { queue, index: payload },
      });
    } else {
      if (payload.type === 'EMPTY_QUEUE') {
        // Clicked on trash icon at top of card (empty queue).
        dispatch(payload);
      } else {
        // Clicked one of the other options (move in queue, delete from queue).
        dispatch({
          type: payload.type,
          payload: { index: payload.index, file: queue[payload.index] },
        });
      }

      // Close dropdown.
      const dropdownElement = evt.srcElement.parentElement.parentElement.parentElement;
      UIkit.dropdown(dropdownElement).hide();
    }
  }

  render() {
    const {
      currentlyPlayingHash, queue, fileOptions, showTrashButton,
    } = this.props;

    if (!queue || queue.length === 0) {
      // TODO: center this. actually, does this ever get rendered?
      return (<p>Queue is empty.</p>);
    }

    const TrashButton = (
      <button
        className="k-button-icon"
        type="button"
        onClick={evt => this.handleClick(evt, { type: 'EMPTY_QUEUE' })}
        uk-icon="icon: trash"
      />
    );

    return (
      <div className="uk-card uk-card-default uk-card-body uk-margin-small-left uk-margin-small-right">
        <table className="uk-table uk-table-divider uk-table-middle">
          <thead>
            <tr>
              <th className="uk-table-shrink" />
              <th className="uk-table-expand">Filename</th>
              <th className="uk-table-shrink">
                {showTrashButton ? TrashButton : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {queue.map((file, index) => (<FileTableRow usePauseIcon={file.hash === currentlyPlayingHash} clickHandler={this.handleClick} file={file} index={index} fileOptions={fileOptions} />))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default connect(mapStateToProps)(WorkQueue);
