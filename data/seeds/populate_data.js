const config = require('../populate_config');
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  return password_hash;
}

exports.seed = async (knex) => {
  /* REGIONAL ORGANIZATION */

  // Create Organization
  const organization_id = 
      await knex('regional_organizations')
          .insert({
            name: config.ORGANIZATION_NAME,
            description: config.ORGANIZATON_DESCRIPTION,
            contact_email: config.ORGANIZATION_CONTACT_EMAIL,
            expiration_date: config.EXPIRATION_DATE,
            locations_limit: config.LOCATIONS_LIMIT,
          })
          .returning('id')

  // Create Organization Locations
  for (const location_name of config.ORGANIZATION_LOCATIONS) {
      // Get the location id and add the regional location organization
      const location = await knex('locations').where({name: location_name}).first();
      if (location) {
        const is_primary_location = config.ORGANIZATION_LOCATIONS.indexOf(location_name) < 1;
        await knex('regional_organization_locations')
                .insert({
                  location_id: location.id,
                  regional_organization_id: Number(organization_id),
                  is_primary_location,
                })
      }
  }

  // Create Organization Collaborators
  for (let collaborator of config.ORGANIZATION_COLLABORATORS) {
  
    // Fetch role
    const role = 
            await knex('roles')
                    .where({
                      scope: collaborator.role.scope,
                      name: collaborator.role.name
                    })
                    .first();
  
    // Create collaborator
    if  (role) {
        // Hash Password
        const password_hash = await hashPassword(collaborator.account.password);
        collaborator.account.password_hash = password_hash;
        delete collaborator.account.password;

        // Create account 
        const account_id = 
          await knex('accounts')
                  .insert(collaborator.account)
                  .returning('id');

        // Create the collaborator
        await knex('collaborators')
                .insert({
                    account_id: Number(account_id),
                    regional_organization_id: Number(organization_id),
                    role_id: Number(role.id)
                })
    }
  }

  /* CLIENTS */
  for (let client of config.CLIENTS) {

    // Find the location_id
    const location = await knex('locations').where({name: client.client_data.location}).first();
    client.client_data.location_id = Number(location.id);
    client.client_data.regional_organization_id = Number(organization_id);
    delete client.client_data.location;

    // Add the client
    if (location) {
        const client_id = 
          await knex('clients')
              .insert(client.client_data)
              .returning('id');


        // Add client collaborators
        for (let collaborator of client.collaborators) {
          // Get collaborator role
          const role = 
              await knex('roles')
                .where({
                  scope: collaborator.role.scope,
                  name: collaborator.role.name
                })
                .first();
            
          if (role) {
            // Hash Password
            const password_hash = await hashPassword(collaborator.account.password);
            collaborator.account.password_hash = password_hash;
            delete collaborator.account.password;

            // Create account 
            const account_id = 
              await knex('accounts')
                      .insert(collaborator.account)
                      .returning('id');

              // Create the collaborator
              await knex('collaborators')
                      .insert({
                          account_id: Number(account_id),
                          client_id: Number(client_id),
                          role_id: Number(role.id)
                      })
              }
        }

        // Add Venues 
        for (let venue of client.venues) {
          venue.created_by = Number(client_id);
          await knex('venues')
                  .insert(venue);
        }
    }
  }

}; 