import app from './app';
import Queue from './Queue';

app.listen(process.env.PORT, () => {
    // init bull queue for processing
    Queue.initialize();
    console.log(`Server started on PORT ${process.env.PORT}`);
});