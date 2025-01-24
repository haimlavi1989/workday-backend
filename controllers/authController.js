const { promisify } = require('util');
const User = require('./../models/userModel');
const AppError = require('./..//utils/appError');
const jwt = require('jsonwebtoken');
const Email = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN_SECONDS,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  // Log the user in, send JWT
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    expiresIn: process.env.JWT_EXPIRES_IN_SECONDS,
    data: {
      user,
    },
  });
};

const handleLoginResponse = (user, res) => {

    try {
      const token = signToken(user.id);
      let expiresIn = process.env.JWT_EXPIRES_IN_SECONDS.slice(0, -1) * 1;
      //  Send token to client
      res.status(200).json({
        status: 'success',
        token,
        expiresIn,
        userId: user._id 
      });
    } catch (err) {
      return next(new AppError(err, 400));
    }
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    // Let user log in after signup
    handleLoginResponse(newUser, res);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    // Check if user exists && password is correct
    if (!user || !(await user.comparePasswords(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }
    handleLoginResponse(user, res);
  } catch (err) {
    return next(new AppError(err, 400));
  }
};


exports.protect = async (req, res, next) => {
  try {
    // Getting token and check of it's there
    let token;
    if (
      req.headers.authorization?.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    //  Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;

    next();
  } catch (err) {
    return next(new AppError(err, 400));
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    // user can only delete is own posts.
    // to complete !

    // if (req.method === 'DELETE' && req.params.id) {
    //     const resourceId = req.params.id; // Extract the resource ID from the request
    //     // Assuming each resource has a creator field containing the ID of the user who created it
    //     const resource = await Resource.findById(resourceId); // Retrieve the resource from your database or storage
    //     if (!resource) {
    //       return next(
    //         new AppError('Resource not found', 404)
    //       );
    //     }
    //     if (resource.creator !== req.user.id) {
    //       return next(
    //         new AppError('You can only access your own resources', 403)
    //       );
    //   }


    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError('There is no user with this email address.', 404)
      );
    }

    // Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send it to user's email
    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError('There was an error sending the email. Try again later!'),
        500
      );
    }
  } catch (err) {
    return next(new AppError(err));
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    // Set new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // Update changedPasswordAt property for the user
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (err) {
    return next(new AppError(err));
  }
};
