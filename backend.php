<?php
require 'vendor/autoload.php';
require_once 'config.inc.php';

use \Payutc\Client\AutoJsonClient;
use \Payutc\Client\JsonException;

$payutcClient = new AutoJsonClient($CONF['payutc_server'], "MYACCOUNT");

if(!isset($_GET['service'])) {
	echo json_encode(array("ERROR" => "Service is mandatory !"));
	die;
}

if(!isset($_GET['ticket'])) {
	echo json_encode(array("CAS" => $payutcClient->getCasUrl()."login?service=".urlencode($_GET['service'])));
	die;
}

try {
	$payutcClient->loginCas(array("ticket" => $_GET["ticket"], "service" => $_GET['service']));
} catch (Exception $e) {
	echo json_encode(array("CAS" => $payutcClient->getCasUrl()."login?service=".urlencode($_GET['service'])));
	die();
}

try {
	$payutcClient->loginApp(array("key" => $CONF['payutc_key']));
	$histo = $payutcClient->historique();
} catch (Exception $e) {
	echo json_encode(array("ERROR" => $e->getMessage()));
	die();
}

echo json_encode($histo);
