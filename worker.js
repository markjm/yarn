// @flow
const {parentPort} = require('worker_threads');
const fs = require('../lib/util/fs-normalized');

parentPort.on('message', async o => {
  try {
    let running = o.actions.length;
    // Safety short circuit in case we somehow start a worker with nothing.
    running === 0 && o.port.postMessage('');

    const onSuccess = () => running === 0 && o.port.postMessage('');
    const onError = err => o.port.emit('error', err);

    await Promise.all(o.actions.map(a => fs.copyFile(a, () => running--).then(onSuccess).catch(onError)));
  } catch (e) {
    // Forcefully close the worker if something failed.
    o.port.close();
  }
});
