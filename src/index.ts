import app from './app';
import Queue from './core/Queue';

if (process.env.NODE_ENV === 'production') {
    console.log = function() {};
}

app.listen(process.env.PORT || 8080, () => {
    // init bull queue for processing
    Queue.initialize();
    console.log(`Server started on PORT ${process.env.PORT || 8080}`);
});