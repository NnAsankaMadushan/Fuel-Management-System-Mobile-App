let themedAlertPresenter = null;
let nativeAlertFallback = null;

const setThemedAlertPresenter = (presenter) => {
  themedAlertPresenter = typeof presenter === 'function' ? presenter : null;
};

const setNativeAlertFallback = (fallback) => {
  nativeAlertFallback = typeof fallback === 'function' ? fallback : null;
};

const showThemedAlert = (title, message, buttons, options) => {
  if (themedAlertPresenter) {
    themedAlertPresenter({
      title,
      message,
      buttons,
      options,
    });
    return;
  }

  if (nativeAlertFallback) {
    nativeAlertFallback(title, message, buttons, options);
  }
};

export { setNativeAlertFallback, setThemedAlertPresenter, showThemedAlert };
