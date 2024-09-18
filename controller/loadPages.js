module.exports.indexPage = async (_req, res) => {
  res.render('index', {pageTitle: 'Home'});
}

module.exports.signUP = async (_req, res) => {
  res.render('registerUser', {pageTitle: 'signUp'});
}

module.exports.signIn = async (_req, res) => {
  res.render('loginUser', {pageTitle: 'signIn'});
}

module.exports.dashboard = async (_req, res) => {
  res.render('dashboard', {pageTitle: 'dashboard'});
}


// changes by kevo 

module.exports.bizsignUP = async (_req, res) => {
  res.render('registerbiz', {pageTitle: 'bizsignUp'});
}

module.exports.bizsignIn = async (_req, res) => {
  res.render('loginbiz', {pageTitle: 'bizsignIn'});
}

module.exports.bizdashboard = async (_req, res) => {
  res.render('bizdashboard', {pageTitle: 'bizdashboard'});
}
