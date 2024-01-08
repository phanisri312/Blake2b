const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;

const dbname = "db";
const url ="mongodb+srv://thotaphanithasri2020:RuoXQUsTpWcWQBcl@cluster0.bhlhc82.mongodb.net/"
const mongoOptions = { useNewUrlParser: true };

const state = { db: null };

const connect = (cb) => {
    if (state.db)
        cb();
    else {
        MongoClient.connect(url, mongoOptions, (err, client) => {
            if (err) cb(err);
            else {
                state.db = client.db(dbname);
                cb();
            }
        });
    }
}

const getPrimaryKey = (_id) => {
    return ObjectID(_id);
}

const getDB = () => {
    return state.db;
}

module.exports = { getDB, connect, getPrimaryKey };