define(function() {
    // Insert custom configuration here
    var config = {
        // Custom CSS Files to load in
        skinCSS : ["/dev/skins/nyu/nyu.skin.css"],

        followLogoutRedirects : true,

        Authentication : {
            "allowInternalAccountCreation": false,
            "internal": false,
            "external": [{
                label: "Proceed to Sign In",
                url: "/system/sling/samlauth/login?resource=/dev/my_sakai.html",
                description: "<p>Please <strong>Proceed to Sign In</strong> and enter your NetID and password.</p><p>You will be redirected back to Atlas upon successful login.</p>"
            }],
            "hideLoginOn": ["/dev", "/dev/index.html", "/dev/create_new_account.html"]
        }
    };
    return config;
});
