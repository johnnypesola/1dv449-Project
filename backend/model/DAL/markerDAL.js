/**
 * Created by jopes on 2015-12-20.
 */

var mongoose = require('mongoose');

// Define a marker schema used for objects stored in mongodb
var markerSchema = new mongoose.Schema({
    source:  String,
    name: String,
    href: String,
    date: { type: Date, default: Date.now },
    location : { // GeoJSON specific declaration
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [ ]
    }
});

// Add index to GeoJSON property
markerSchema.index({ location : '2dsphere' });

// Create marker DAL model
MarkerDAL = mongoose.model('MarkerDAL', markerSchema);



module.exports = MarkerDAL;