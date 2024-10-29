<?php

namespace TanteNetty\SwwReservations;

use TanteNetty\SwwReservations\Models\Schema\AddReservationsTable;
//use TanteNetty\SwwReservations\Models\Schema\AddCustomersTable;


/**
 * Plugin God class.
 */
class Plugin {

	/**
	 * Runs when the plugin is first activated.
	 *
	 * @return void
	 */
	public function install(): void {

		self::run_migrations();

	}

	/**
	 * (Re-)install the database tables
	 *
	 * @return void
	 */
	public static function run_migrations(): void {
		// Run migrations.
		( new AddReservationsTable() )->maybe_run();
		//( new AddCustomersTable() )->maybe_run();
	}

	/**
	 * Call all classes needed for the custom functionality.
	 */
	public function init(): void {

		
	}

	/**
	 * Boot the plugin
	 *
	 * @return void
	 */
	public function boot(): void {
		/*$capsule = new Capsule();
		$capsule->addConnection(
			[
				'driver'    => 'mysql',
				'host'      => \DB_HOST,
				'database'  => \DB_NAME,
				'username'  => \DB_USER,
				'password'  => \DB_PASSWORD,
				'charset'   => 'utf8',
				'collation' => 'utf8_unicode_ci',
				'prefix'    => '',
			]
		);

		// Make this Capsule instance available globally via static methods... (optional).
		$capsule->setAsGlobal();

		// Setup the Eloquent ORM... (optional; unless you've used setEventDispatcher()).
		$capsule->bootEloquent();*/
	}
}
