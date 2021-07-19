const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    require: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "please add a description"],
  },
  weeks: {
    type: Number,
    required: [true, "please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "please add a cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "please add a minimum skills"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    require: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    require: true,
  },
});

/*
static on model
Course.gofish()

method on query
const cource= Cource.find();
cource.gofish();
*/

//static method to get average of course tuition
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  const obj = await this.aggregate([
    //pipeline
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (err) {
    console.log(err);
  }
};

//call getAverageCost after save
CourseSchema.post("save", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
});

//call getAverageCost before remove
CourseSchema.pre("remove", function (next) {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
