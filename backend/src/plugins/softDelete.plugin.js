module.exports = function softDeletePlugin(schema) {

  // add soft delete field
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false
    }
  });

  // filter deleted records automatically
  schema.pre("find", function () {
    this.where({ isDeleted: false });
  });

  schema.pre("findOne", function () {
    this.where({ isDeleted: false });
  });

};