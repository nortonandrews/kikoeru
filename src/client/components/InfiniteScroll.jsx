/**
 * Apologies for this trainwreck. Copied and pasted from
 * https://www.npmjs.com/package/react-infinite-scroll-component
 * with a few small changes because I didn't want to install react-compat.
 */

import { Component } from 'inferno';

const ThresholdUnits = {
  Pixel: 'Pixel',
  Percent: 'Percent',
};

const defaultThreshold = {
  unit: ThresholdUnits.Percent,
  value: 0.8,
};

const parseThreshold = (scrollThreshold) => {
  if (typeof scrollThreshold === 'number') {
    return {
      unit: ThresholdUnits.Percent,
      value: scrollThreshold * 100,
    };
  }

  if (typeof scrollThreshold === 'string') {
    if (scrollThreshold.match(/^(\d*(\.\d+)?)px$/)) {
      return {
        unit: ThresholdUnits.Pixel,
        value: parseFloat(scrollThreshold),
      };
    }

    if (scrollThreshold.match(/^(\d*(\.\d+)?)%$/)) {
      return {
        unit: ThresholdUnits.Percent,
        value: parseFloat(scrollThreshold),
      };
    }

    console.warn('scrollThreshold format is invalid. Valid formats: "120px", "50%"...');

    return defaultThreshold;
  }

  console.warn('scrollThreshold should be string or number');

  return defaultThreshold;
};

// https://remysharp.com/2010/07/21/throttling-function-calls
const throttle = (fn, threshhold, scope) => {
  threshhold || (threshhold = 250);
  let last;
  let deferTimer;
  return function () {
    const context = scope || this;

    const now = +new Date();
    const args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
};

class InfiniteScroll extends Component {
  constructor(props) {
    super();
    this.state = {
      showLoader: false,
      lastScrollTop: 0,
      actionTriggered: false,
      pullToRefreshThresholdBreached: false,
    };
    // variables to keep track of pull down behaviour
    this.startY = 0;
    this.currentY = 0;
    this.dragging = false;
    // will be populated in componentDidMount
    // based on the height of the pull down element
    this.maxPullDownDistance = 0;

    this.onScrollListener = this.onScrollListener.bind(this);
    this.throttledOnScrollListener = throttle(this.onScrollListener, 150).bind(
      this,
    );
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.getScrollableTarget = this.getScrollableTarget.bind(this);
  }

  componentDidMount() {
    this._scrollableNode = this.getScrollableTarget();
    this.el = this.props.height
      ? this._infScroll
      : this._scrollableNode || window;
    this.el.addEventListener('scroll', this.throttledOnScrollListener);

    if (
      typeof this.props.initialScrollY === 'number'
      && this.el.scrollHeight > this.props.initialScrollY
    ) {
      this.el.scrollTo(0, this.props.initialScrollY);
    }

    if (this.props.pullDownToRefresh) {
      this.el.addEventListener('touchstart', this.onStart);
      this.el.addEventListener('touchmove', this.onMove);
      this.el.addEventListener('touchend', this.onEnd);

      this.el.addEventListener('mousedown', this.onStart);
      this.el.addEventListener('mousemove', this.onMove);
      this.el.addEventListener('mouseup', this.onEnd);

      // get BCR of pullDown element to position it above
      this.maxPullDownDistance = this._pullDown.firstChild.getBoundingClientRect().height;
      this.forceUpdate();

      if (typeof this.props.refreshFunction !== 'function') {
        throw new Error(
          `Mandatory prop "refreshFunction" missing.
          Pull Down To Refresh functionality will not work
          as expected. Check README.md for usage'`,
        );
      }
    }
  }

  componentWillUnmount() {
    this.el.removeEventListener('scroll', this.throttledOnScrollListener);

    if (this.props.pullDownToRefresh) {
      this.el.removeEventListener('touchstart', this.onStart);
      this.el.removeEventListener('touchmove', this.onMove);
      this.el.removeEventListener('touchend', this.onEnd);

      this.el.removeEventListener('mousedown', this.onStart);
      this.el.removeEventListener('mousemove', this.onMove);
      this.el.removeEventListener('mouseup', this.onEnd);
    }
  }

  componentWillReceiveProps(props) {
    // do nothing when dataLength and key are unchanged
    if (this.props.key === props.key && this.props.dataLength === props.dataLength) return;

    // update state when new data was sent in
    this.setState({
      showLoader: false,
      actionTriggered: false,
      pullToRefreshThresholdBreached: false,
    });
  }

  getScrollableTarget() {
    if (this.props.scrollableTarget instanceof HTMLElement) return this.props.scrollableTarget;
    if (typeof this.props.scrollableTarget === 'string') {
      return document.getElementById(this.props.scrollableTarget);
    }
    if (this.props.scrollableTarget === null) {
      console.warn(`You are trying to pass scrollableTarget but it is null. This might
        happen because the element may not have been added to DOM yet.
        See https://github.com/ankeetmaini/react-infinite-scroll-component/issues/59 for more info.
      `);
    }
    return null;
  }

  onStart(evt) {
    if (this.state.lastScrollTop) return;

    this.dragging = true;
    this.startY = evt.pageY || evt.touches[0].pageY;
    this.currentY = this.startY;

    this._infScroll.style.willChange = 'transform';
    this._infScroll.style.transition = 'transform 0.2s cubic-bezier(0,0,0.31,1)';
  }

  onMove(evt) {
    if (!this.dragging) return;
    this.currentY = evt.pageY || evt.touches[0].pageY;

    // user is scrolling down to up
    if (this.currentY < this.startY) return;

    if (this.currentY - this.startY >= this.props.pullDownToRefreshThreshold) {
      this.setState({
        pullToRefreshThresholdBreached: true,
      });
    }

    // so you can drag upto 1.5 times of the maxPullDownDistance
    if (this.currentY - this.startY > this.maxPullDownDistance * 1.5) return;

    this._infScroll.style.overflow = 'visible';
    this._infScroll.style.transform = `translate3d(0px, ${this.currentY
      - this.startY}px, 0px)`;
  }

  onEnd(evt) {
    this.startY = 0;
    this.currentY = 0;

    this.dragging = false;

    if (this.state.pullToRefreshThresholdBreached) {
      this.props.refreshFunction && this.props.refreshFunction();
    }

    requestAnimationFrame(() => {
      // this._infScroll
      if (this._infScroll) {
        this._infScroll.style.overflow = 'inherit';
        this._infScroll.style.transform = 'none';
        this._infScroll.style.willChange = 'none';
      }
    });
  }

  isElementAtBottom(target, scrollThreshold = 0.8) {
    const clientHeight = target === document.body || target === document.documentElement
      ? window.screen.availHeight
      : target.clientHeight;

    const threshold = parseThreshold(scrollThreshold);

    if (threshold.unit === ThresholdUnits.Pixel) {
      return (
        target.scrollTop + clientHeight >= target.scrollHeight - threshold.value
      );
    }

    return (
      target.scrollTop + clientHeight >= threshold.value / 100 * target.scrollHeight
    );
  }

  onScrollListener(event) {
    if (typeof this.props.onScroll === 'function') {
      // Execute this callback in next tick so that it does not affect the
      // functionality of the library.
      setTimeout(() => this.props.onScroll(event), 0);
    }

    const target = this.props.height || this._scrollableNode
      ? event.target
      : document.documentElement.scrollTop
        ? document.documentElement
        : document.body;

    // return immediately if the action has already been triggered,
    // prevents multiple triggers.
    if (this.state.actionTriggered) return;

    const atBottom = this.isElementAtBottom(target, this.props.scrollThreshold);

    // call the `next` function in the props to trigger the next data fetch
    if (atBottom && this.props.hasMore) {
      this.setState({ actionTriggered: true, showLoader: true });
      this.props.next();
    }
    this.setState({ lastScrollTop: target.scrollTop });
  }

  render() {
    const style = {
      height: this.props.height || 'auto',
      overflow: 'inherit',
      WebkitOverflowScrolling: 'touch',
      ...this.props.style,
    };
    const hasChildren = this.props.hasChildren
      || !!(this.props.children && this.props.children.length);

    // because heighted infiniteScroll visualy breaks
    // on drag down as overflow becomes visible
    const outerDivStyle = this.props.pullDownToRefresh && this.props.height
      ? { overflow: 'inherit' }
      : {};
    return (
      <div style={outerDivStyle}>
        <div
          className={`infinite-scroll-component ${this.props.className || ''}`}
          ref={(infScroll) => (this._infScroll = infScroll)}
          style={style}
        >
          {this.props.pullDownToRefresh && (
            <div
              style={{ position: 'relative' }}
              ref={(pullDown) => (this._pullDown = pullDown)}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: -1 * this.maxPullDownDistance,
                }}
              >
                {!this.state.pullToRefreshThresholdBreached
                  && this.props.pullDownToRefreshContent}
                {this.state.pullToRefreshThresholdBreached
                  && this.props.releaseToRefreshContent}
              </div>
            </div>
          )}
          {this.props.children}
          {!this.state.showLoader
            && !hasChildren
            && this.props.hasMore
            && this.props.loader}
          {this.state.showLoader && this.props.hasMore && this.props.loader}
          {!this.props.hasMore && this.props.endMessage}
        </div>
      </div>
    );
  }
}

export default InfiniteScroll;
