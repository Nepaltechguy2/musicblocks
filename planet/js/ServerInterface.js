// Copyright (c) 2017 Euan Ong
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

function ServerInterface(Planet) {
    this.ServerHostname = "http://localhost:2020";
    this.ConnectionFailureData = {
        success: false,
        error: "ERROR_CONNECTION_FAILURE"
    };
    this.APIKey = "3f2d3a4c-c7a4-4c3c-892e-ac43784f7381";

    this.GET = function (api_request_name, params, callback) {
        let searchParams = new URLSearchParams(params);
        jQuery.ajax({
            url: `${this.ServerHostname}/${api_request_name}?${searchParams}`,
            type: "GET",
            timeout: 0,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            processData: false,
            mimeType: "application/x-www-form-urlencoded",
            contentType: false,
            success: result => callback(JSON.parse(result)),
            error: _ => callback(this.ConnectionFailureData)
        });
    };

    this.POST = function (api_request_name, data, callback) {
        let form = new URLSearchParams();
        Object.keys(data).forEach(key => {
            if (typeof data[key] === "object") data[key] = JSON.stringify(data[key]);
            form.append(key, data[key]);
        });
        jQuery.ajax({
            url: `${this.ServerHostname}/${api_request_name}`,
            method: "POST",
            timeout: 0,
            processData: false,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            contentType: false,
            data: form,
            success: data => {
                if(data.token){
                    localStorage.setItem("token", data.token)
                }
                callback(data)
            },
            error: _ => callback(this.ConnectionFailureData)
        });
    };
    this.getTagManifest = function (callback) {
        this.GET("api/tags", "", callback);
    };

    this.addProject = function (data, userInfo, callback) {
        // first, see if TRIED to login.
        if (userInfo)
            this.GET("api/user/info", {}, user => {
                if (user.success) {
                    console.debug("Logged in, adding project.");
                    this.POST("api/project", JSON.parse(data), callback);
                } else {
                    console.debug("Not logged in, creating user...");
                    this.POST("api/user/create", userInfo, createUserResult => {
                        if (createUserResult.success) {
                            localStorage.setItem("username", userInfo.username);
                            console.debug("Created user. Adding Project");
                            this.POST("api/project", JSON.parse(data), callback);
                        } else {
                            callback(createUserResult);
                        }
                    });
                }
            });
        else {
            this.POST("api/project", JSON.parse(data), callback);
        }

    };

    this.downloadProjectList = function (
        ProjectTags,
        ProjectSort,
        Start,
        End,
        callback
    ) {
        this.GET(
            "api/project/search",
            {
                tags: ProjectTags,
                sort: ProjectSort,
                start: Start,
                end: End
            },
            callback
        );
    };

    this.getProjectDetails = function (ProjectID, callback) {
        this.GET(`api/project/${ProjectID}`, "", callback);
    };

    this.searchProjects = function (Search, ProjectSort, Start, End, callback) {
        this.GET(
            "api/project/search",
            {
                query: Search,
                sort: ProjectSort,
                start: Start,
                end: End
            },
            callback
        );
    };

    this.downloadProject = function (ProjectID, callback) {
        this.GET(`api/project/${ProjectID}/download`, "", callback);
    };

    this.likeProject = function (ProjectID, Like, callback) {
        this.POST(`api/project/${ProjectID}/like/${Like ? 1 : 0}`, {}, callback);
    };

    this.reportProject = function (ProjectID, Description, callback) {
        this.POST(
            `api/project/${ProjectID}/report`,
            {reason: Description},
            callback
        );
    };

    this.convertFile = function (From, To, Data, callback) {
        this.POST(`api/convertData/${From}/${To}`, {data: Data}, callback);
    };

    this.searchGroups = function (searchVal, callback) {
        this.GET("api/groups", {},result => {
            let rslt = {};
            result.data.forEach(obj => rslt[obj.name] = null);
            callback(rslt);
        });
    };

    this.getLoggedInValues = function(callback) {
        this.GET("api/user/info", {}, callback);
    };

    this.init = function () {
    };
}
