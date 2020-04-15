import express from "express";
const app = express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );

app.get( "/bye", (req, res) => {
	const x: number = 10;
	res.send( "Bye world!" + x);
});


// start the Express server
app.listen( port, () => {
    console.log( 'server started at http://localhost:${ port }' );
} );

module.exports = app;
