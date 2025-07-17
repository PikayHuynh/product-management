module.exports.createPost = (req, res, next) => {
    if(!req.body.title) {
        req.flash("error", "Vui lòng nhập tiêu đề");
        const backURL = req.get("Referer");
        res.redirect(backURL);
        return;
    }
    next();
}