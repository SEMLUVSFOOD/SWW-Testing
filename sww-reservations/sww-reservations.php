<?php
/**
 * Plugin Name: SWW Reservations
 * Plugin URI: https://studiowoenselwest.nl
 * Description: 
 * Version: 0
 * Author: 
 * Author URI: https://wooping.io
 * Text Domain: 
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 */

use TanteNetty\SwwReservations\Plugin;

require dirname( __FILE__ ) . '/vendor/autoload.php';

// Upon activation check if the data model is in order.
register_activation_hook( __FILE__, function() {
	( new Plugin() )->install();
} );

/**
 * Bootstrap the plugin.
 */
/*
function ssw_reservations_plugin() : Plugin {
	static $plugin;

	if ( is_object( $plugin ) ) {
		return $plugin;
	}

	$plugin = new Plugin();
    $plugin->boot();
	$plugin->init();

	return $plugin;
}

add_action( 'plugins_loaded', 'ssw_reservations_plugin' );
*/
