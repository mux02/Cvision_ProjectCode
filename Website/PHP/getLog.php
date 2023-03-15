<?php

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Backend for API
$url = "https://zq8x0h71ch.execute-api.me-south-1.amazonaws.com/default/getLog";

// Sending request through the following configuration...
$curl = curl_init($url);
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

// For debug only!
curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

$resp = curl_exec($curl); // Execute our request (GET API)
curl_close($curl); // Close the connection

echo $resp; // Print out the result
