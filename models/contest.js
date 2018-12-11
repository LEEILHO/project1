var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  summary: {type: String, trim: true, required: true},
  organizer : {type: String, trim: true, required: true},
  categori: {type: String, trim : true, required: true},
  objects: {type:String, trim: true, required: true},
  phone: {type: String, trim:true, required: true},
  tags:[String],
  numLikes: {type: Number, default: 0},
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var contest = mongoose.model('contest', schema);

module.exports = contest;
