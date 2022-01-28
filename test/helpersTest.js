const {assert} = require('chai');

const {findUserByEmail} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, testUsers[expectedUserID]);
  });

  it('if email that is not in our users database should return undefined', function() {
    const user = findUserByEmail("non-existent@example.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });

});

