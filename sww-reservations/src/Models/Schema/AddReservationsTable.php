<?php

namespace TanteNetty\SwwReservations\Models\Schema;

use MindBlown\ShopHealth\Contracts\Schema;

/**
 * Class AddIssuesTable
 *
 * Represents a table to add issues.
 */
class AddReservationsTable extends Schema {

	/**
	 * Define the table name.
	 */
	protected string $table_name = 'reservations';

	/**
	 * Check if our table exists, if not, run the schema.
	 */
	public function maybe_run(): void {
		global $wpdb;
		$query = $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $this->get_table_name() ) );

		// phpcs:ignore
		if ( $wpdb->get_var( $query ) !== $this->get_table_name() ) {
			$this->run();
		}
	}

	/**
	 * Run the query that will add our table
	 *
	 * @return void
	 */
	public function run(): void {
		global $wpdb;
		$charset_collate            = $wpdb->get_charset_collate();
		$table_name                 = \esc_sql( $this->get_table_name() );

		$query = "CREATE TABLE `$table_name` (
            id int NOT NULL AUTO_INCREMENT,
            customer_id int DEFAULT NULL,
            reservation_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            time_slot ENUM('morning', 'afternoon', 'whole_day') DEFAULT 'open',
            num_of_people int DEFAULT NULL,
            total_price decimal DEFAULT 0,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            ) $charset_collate";

		require_once \ABSPATH . 'wp-admin/includes/upgrade.php';

		// @todo: possibly have this function return a state in the future, to see if a migration went ok.

		// phpcs:ignore
		\dbDelta( $query );
	}
}
