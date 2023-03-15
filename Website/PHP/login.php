<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (isset($_POST['submit'])) {

    $username = $_POST['name'];
    $password = $_POST['pass'];

    if (!empty($username) && !empty($password)) {

        // Backend for API
        $url = "https://7qt9i1awb7.execute-api.me-south-1.amazonaws.com/default/CVision_Login";
        // Type your API link here

        // Sending request through the following configuration...
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

        // Determine request type and other properties
        $headers = array(
            "Content-Type: application/json",
        );
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers); // Assign headers info with the request

        // The data that will be posted with the request
        $data = <<<DATA
            {
                "Username": "$username",
                "Password": "$password"
            }
            DATA;

        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);

        // For debug only!
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

        $resp = curl_exec($curl); // Execute our request (POST API)
        curl_close($curl); // Close the connection
        // Identify the result as variable

        echo $resp; // Print out the result

    } else {
        echo json_encode(["error" => "smothing went wrong"]);
    }
}
