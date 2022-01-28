// function to search for email in users database

function findUserByEmail(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
}


module.exports = {findUserByEmail};