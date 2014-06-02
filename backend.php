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

// Parametres pour le calcul d'alcoolémie
$bieres = array(
	"Grand Cru St Feuillien" => array(
		"volume" => 0.33,
		"deg" => 9.5
		),
	"Carolus Triple" => array(
		"volume" => 0.33,
		"deg" => 9
		),
	"Peche Mel Bush" => array(
		"volume" => 0.33,
		"deg" => 8.5
		),
	"Rochefort 8" => array(
		"volume" => 0.33,
		"deg" => 9.2
		),
	// Duvel
	"Duvel" => array(
		"volume" => 0.33,
		"deg" => 8.5
		),
	// Westmalle Triple
	1398 => array(
		"volume" => 0.33,
		"deg" => 9.5
		),
	// Chimay Bleu
	1399 => array(
		"volume" => 0.33,
		"deg" => 9
		),
	// Silly Scotch
	1400 => array(
		"volume" => 0.33,
		"deg" => 8
		),
	// Pere canard
	1659 => array(
		"volume" => 0.33,
		"deg" => 9
		),
	// Silly Scotch Barrel Aged
	1661 => array(
		"volume" => 0.75,
		"deg" => 8
		),
	// Bacchus Framboise
	1902 => array(
		"volume" => 0.33,
		"deg" => 5
		),
	// Carolus Van der Keiser
	1903 => array(
		"volume" => 0.33,
		"deg" => 11
		),
	// Blanche des honnelles 
	1904 => array(
		"volume" => 0.33,
		"deg" => 6
		),
	// Cuvée des trolls
	457 => array(
		"volume" => 0.35,
		"deg" => 7
		),
	// Delirium
	458 => array(
		"volume" => 0.35,
		"deg" => 8.5
		),
	// Tripel Karmeliet
	466 => array(
		"volume" => 0.35,
		"deg" => 8
		),
	// Mc Chouffe
	697 => array(
		"volume" => 0.35,
		"deg" => 8
		),
	// Gauloise Rouge
	1401 => array(
		"volume" => 0.35,
		"deg" => 8.2
		),
	// Kwak
	1402 => array(
		"volume" => 0.35,
		"deg" => 8.1
		),
	// Hopus
	1664 => array(
		"volume" => 0.35,
		"deg" => 8.3
		),
	// Carolus Classic
	1666 => array(
		"volume" => 0.35,
		"deg" => 8.5
		),
	// Barbar Bok
	1667 => array(
		"volume" => 0.35,
		"deg" => 8.5
		),
	// Chouffe Soleil
	1796 => array(
		"volume" => 0.35,
		"deg" => 6
		)
	);

$taux = null;
$date = null;

if(isset($_GET["sexe"]) && $_GET["sexe"] = "M") {
	$K = 0.7;
} else {
	$K = 0.6;
}

if(isset($_GET["masse"])) {
	$M = $_GET["masse"];
} else {
	$M = 60;
}

foreach(array_reverse($histo->historique) as $h) {
	if($h->type != "PURCHASE") {
		continue;
	}
	
	if(isset($bieres[$h->name])) {
		$date_prise = new DateTime($h->date);
		$date_pic = new DateTime($h->date);
		$date_pic->add(new DateInterval('PT45M'));

		if($taux == null) {
			$taux = 0;
			$date = $date_pic;
		} else {
			$taux -= 1;
		}
		$taux += ($bieres[$h->name]["volume"] * 1000 * $bieres[$h->name]["deg"] * 0.8) / ($K * $M);

	}
}

echo json_encode(array("SUCCESS" => array("taux" => $taux)));
