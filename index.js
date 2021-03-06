/*************************************************************************************
 * Product: ADempiere gRPC Dictionary Client                       		               *
 * Copyright (C) 2012-2018 E.R.P. Consultores y Asociados, C.A.                      *
 * Contributor(s): Yamel Senih ysenih@erpya.com				  		                         *
 * This program is free software: you can redistribute it and/or modify              *
 * it under the terms of the GNU General Public License as published by              *
 * the Free Software Foundation, either version 3 of the License, or                 *
 * (at your option) any later version.                                               *
 * This program is distributed in the hope that it will be useful,                   *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                    *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                     *
 * GNU General Public License for more details.                                      *
 * You should have received a copy of the GNU General Public License                 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.            *
 ************************************************************************************/
class Enrollment {

  /**
   * Constructor, No authentication required
   * @param {string} host
   * @param {string} version
   * @param {string} applicationType Application Type or client Type from request
   */
  constructor(host, version, applicationType) {
    this.host = host;
    this.version = version;
    this.applicationType = applicationType;
  }

  /**
   * Load gRPC Connection
   * @return {object} Return request for get data
   */
  getService() {
    const grpc_promise = require('grpc-promise');
    const { RegisterPromiseClient } = require('./src/grpc/proto/enrollment_grpc_web_pb.js');
    const requestService = new RegisterPromiseClient(this.host);
    grpc_promise.promisifyAll(requestService);
    return requestService;
  }

  /**
   * Get user roles assigned
   * @param {string} name Name
   * @param {string} userName User Name
   * @param {string} eMail EMail
   * @param {string} password password optional
   * @return {User} Enrolled User
   */
  enrollUser({ name, userName, eMail, password }) {
    const { EnrollUserRequest } = require('./src/grpc/proto/enrollment_pb.js');
    const request = new EnrollUserRequest();
    request.setName(name);
    request.setUsername(userName);
    request.setEmail(eMail);
    if (password && password.trim() !== '') {
      request.setPassword(password);
    }
    request.setClientversion(this.version);
    return this.getService().enrollUser(request)
      .then(enrollUserResponse => {
        return {
	        name: enrollUserResponse.getName(),
	        userName: enrollUserResponse.getUsername(),
	        eMail: enrollUserResponse.getEmail()
        };
      });
  }

  /**
   * Request Reset a Password
   * @param {string} eMailOrUserName User Name or User eMail
   * @return {ResetPasswordResponse} Response Request
   */
  requestResetPassword(eMailOrUserName) {
    const { ResetPasswordRequest, ResetPasswordResponse } = require('./src/grpc/proto/enrollment_pb.js');
    const request = new ResetPasswordRequest();

    if (eMailOrUserName.includes('@')) {
      request.setEmail(eMailOrUserName);
    } else {
      request.setUsername(eMailOrUserName);
    }

    return this.getService().resetPassword(request)
      .then(responseResetPassword => {
        const status = Object.keys(ResetPasswordResponse.ResponseType).find(key => {
          return ResetPasswordResponse.ResponseType[key] === responseResetPassword.getResponsetype()
        });

        return {
          responseType: responseResetPassword.getResponsetype(),
          responseTypeStatus: status
        };
      });
  }

  /**
   * Request Reset a Password from a Token
   * @param {string} token token assigned
   * @param {string} password Password to reset
   * @return {ResetPasswordResponse} Response Request
   */
  resetPasswordFromToken({ token, password }) {
    const { ResetPasswordTokenRequest, ResetPasswordResponse } = require('./src/grpc/proto/enrollment_pb.js');
    const request = new ResetPasswordTokenRequest();
    request.setToken(token);
    request.setPassword(password);
    return this.getService().resetPasswordFromToken(request)
      .then(responseResetPassword => {
        const status = Object.keys(ResetPasswordResponse.ResponseType).find(key => {
          return ResetPasswordResponse.ResponseType[key] === responseResetPassword.getResponsetype()
        });

        return {
          responseType: responseResetPassword.getResponsetype(),
          responseTypeStatus: status
        };
      });
  }

  /**
   * Request Activate a user from token
   * @param {string} token token assigned
   * @return {ActivateUserResponse} Response Request
   */
  activateUser(token) {
    const { ActivateUserRequest, ActivateUserResponse } = require('./src/grpc/proto/enrollment_pb.js');
    const request = new ActivateUserRequest();
    request.setToken(token);
    request.setClientversion(this.version);
    return this.getService().activateUser(request)
      .then(responseActivateUser => {
        const status = Object.keys(ActivateUserRequest.ResponseType).find(key => {
          return ActivateUserRequest.ResponseType[key] === responseActivateUser.getResponsetype()
        });

        return {
          responseType: responseActivateUser.getResponsetype(),
          responseTypeStatus: status
        };
      });
  }

}

module.exports = Enrollment;
