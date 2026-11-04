import { Link, withRouter } from 'inferno-router';
import UIkit from 'uikit';

const closeOffCanvasNav = () => {
  const element = document.getElementById('offcanvas-nav');
  UIkit.offcanvas(element).hide();
};

function OffCanvasNav(props) {
  const { location } = props;
  const path = location.pathname;

  return (
    <div id="offcanvas-nav" uk-offcanvas="mode: reveal; overlay: true; flip: true">
      <div className="uk-offcanvas-bar uk-flex uk-flex-column">
        <ul className="uk-nav uk-nav-primary uk-nav-center uk-margin-auto-vertical">
          <li className="k-logo k-logo-muted" />
          <li className="uk-nav-header">Browse</li>
          <li className={path === '/' ? 'uk-active' : 'uk-parent'}>
            <Link to="/" onClick={closeOffCanvasNav}>
              <span className="uk-margin-small-right" uk-icon="icon: thumbnails" />
              Works
            </Link>
          </li>

          <li className={path === '/circles/' ? 'uk-active' : 'uk-parent'}>
            <Link to="/circles/" onClick={closeOffCanvasNav}>
              <span className="uk-margin-small-right" uk-icon="icon: users" />
              Circles
            </Link>
          </li>

          <li className={path === '/tags/' ? 'uk-active' : 'uk-parent'}>
            <Link to="/tags/" onClick={closeOffCanvasNav}>
              <span className="uk-margin-small-right" uk-icon="icon: tag" />
              Tags
            </Link>
          </li>

          <li className={path === '/vas/' ? 'uk-active' : 'uk-parent'}>
            <Link to="/vas/" onClick={closeOffCanvasNav}>
              <span className="uk-margin-small-right" uk-icon="icon: microphone" />
              VAs
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
const OffCanvasNavWithRouter = withRouter(OffCanvasNav);

function NavBar(props) {
  const { location } = props;
  const transparent = location.pathname === '/player/';

  return (
    <div className={`uk-navbar uk-navbar-container uk-navbar-transparent ${transparent ? '' : 'uk-background-secondary'}`} uk-navbar>
      <div className="uk-navbar-left uk-dark">
        <div className="uk-navbar-item uk-logo">
          <span className="k-logo" />
        </div>
      </div>

      <div className="uk-navbar-right">
        <button type="button" className="uk-navbar-toggle" uk-toggle="target: #offcanvas-nav" uk-navbar-toggle-icon />
        <OffCanvasNavWithRouter />
      </div>
    </div>
  );
}

export default withRouter(NavBar);
