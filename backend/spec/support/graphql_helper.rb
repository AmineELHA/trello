module GraphqlHelpers
  def graphql_query(query, variables: {}, context: {})
    BackendSchema.execute(query, variables: variables, context: context)
  end
end

RSpec.configure do |config|
  config.include GraphqlHelpers
end
