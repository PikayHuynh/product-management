module.exports.registerPost = (req, res, next) => {
  if(!req.body.fullName) {
    req.flash("error", "Vui lòng nhập họ tên!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  if(!req.body.email) {
    req.flash("error", "Vui lòng nhập email!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  if(!req.body.password) {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  next();
};

module.exports.loginPost = (req, res, next) => {
  if(!req.body.email) {
    req.flash("error", "Vui lòng nhập email!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  if(!req.body.password) {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  next();
};


module.exports.registerPost = (req, res, next) => {
  if(!req.body.fullName) {
    req.flash("error", "Vui lòng nhập họ tên!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  if(!req.body.email) {
    req.flash("error", "Vui lòng nhập email!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  if(!req.body.password) {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  next();
};

module.exports.forgotPasswordPost = (req, res, next) => {
  if(!req.body.email) {
    req.flash("error", "Vui lòng nhập email!");
    const backURL = req.get("Referer");
    res.redirect(backURL);
    return;
  }
  next();
};

module.exports.resetPasswordPost = (req, res, next) => {
  const backURL = req.get("Referer");
  if(!req.body.password) {
    req.flash("error", "Vui lòng nhập mật khẩu!");
    res.redirect(backURL);
    return;
  }
  if(!req.body.confirmPassword) {
    req.flash("error", "Vui lòng xác nhận mật khẩu!");
    res.redirect(backURL);
    return;
  }

  if(req.body.confirmPassword !== req.body.password) {
    req.flash("error", "Mật khẩu không khớp!");
    res.redirect(backURL);
    return;
  }
  next();
};

