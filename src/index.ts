import app from './app';
import Queue from './Queue';
import config from './../config.js';

app.listen(config.PORT, () => {
    // init bull queue for processing
    Queue.initialize();
    console.log(`Server started on PORT ${config.PORT}`);
});