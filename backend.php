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
	"Duvel" => array(
		"volume" => 0.33,
		"deg" => 8.5
		),
	"Westmalle Triple" => array(
		"volume" => 0.33,
		"deg" => 9.5
		),
	"Chimay Bleue" => array(
		"volume" => 0.33,
		"deg" => 9
		),
	"Scotch Silly" => array(
		"volume" => 0.33,
		"deg" => 8
		),
	"Père Canard" => array(
		"volume" => 0.33,
		"deg" => 9
		),
	"Scotch Silly Barrel Aged" => array(
		"volume" => 0.75,
		"deg" => 8
		),
	"Bacchus Framboise" => array(
		"volume" => 0.375,
		"deg" => 5
		),
	"Carolus Van Der Keizer" => array(
		"volume" => 0.75,
		"deg" => 11
		),
	"Blanche des Honnelles" => array(
		"volume" => 0.33,
		"deg" => 6
		),
	"Cuvée des Trolls" => array(
		"volume" => 0.35,
		"deg" => 7
		),
	"Delirium Tremens" => array(
		"volume" => 0.35,
		"deg" => 8.5
		),
	"Tripel Karmeliet" => array(
		"volume" => 0.35,
		"deg" => 8
		),
	"Mc Chouffe" => array(
		"volume" => 0.35,
		"deg" => 8
		),
	"Gauloise Rouge" => array(
		"volume" => 0.35,
		"deg" => 8.2
		),
	"Kwak" => array(
		"volume" => 0.35,
		"deg" => 8.1
		),
	"Hopus" => array(
		"volume" => 0.35,
		"deg" => 8.3
		),
	"Carolus Classic" => array(
		"volume" => 0.35,
		"deg" => 8.5
		),
	"Barbar Bok" => array(
		"volume" => 0.35,
		"deg" => 8.5
		),
	"Chouffe Soleil" => array(
		"volume" => 0.35,
		"deg" => 6
		),
	"Blanche des Honnelles" => array(
		"volume" => 0.33,
		"deg" => 6
		),
	"Titje" => array(
		"volume" => 0.25,
		"deg" => 5
		),
	"Double Enghien" => array(
		"volume" => 0.35,
		"deg" => 7.5
		)
	);

$taux = 0;
$date = null;

if(isset($_GET["sexe"]) && $_GET["sexe"] == "M") {
	$K = 0.7;
} else {
	$K = 0.6;
}

if(isset($_GET["masse"])) {
	$M = $_GET["masse"];
} else {
	$M = 60;
}

$historique = array();

foreach(array_reverse($histo->historique) as $h) {
	if($h->type != "PURCHASE") {
		continue;
	}

	if(isset($bieres[$h->name])) {
		$date_pic = new DateTime($h->date);
		$date_pic->add(new DateInterval('PT45M'));
		if($date == null) {
			$date = $date_pic;
		} else {
			$diff = ($date_pic->getTimestamp() - $date->getTimestamp()) / 3600; // Calcul en heures
			$taux -= 0.15 * $diff;
			if($taux < 0) {
				$taux = 0;
			}
			$date = $date_pic;
		}
		$taux += ($bieres[$h->name]["volume"] * 1000 * $bieres[$h->name]["deg"] / 100 * 0.8) / ($K * $M);
		$historique[] = array("date"=> $date, "taux"=>$taux);
	}
}

$now = new DateTime();
$tauxmax = $taux;
if($date) {
	$diff = ($now->getTimestamp() - $date->getTimestamp()) / 3600; // Calcul en heures
	if($diff < 0) {
		// Taux d'alcoolémie annoncé pas encore atteint
	} else {
		$taux -= 0.15 * $diff;
		if($taux < 0) {
			$taux = 0;
		}
	}
}

echo json_encode(array("SUCCESS" => array("taux" => number_format($taux, 2), "tauxmax" => number_format($tauxmax, 2), "date" => $date, "histo" => $historique)));
