#!/usr/bin/env ruby

require 'sinatra'
require 'redd/middleware'
require './helper_functions'

set :bind, '0.0.0.0' if ARGV[0] == 'production'
set :port, 8080

$reddit_post_id = '417weg'  # need to prompt for this along with authentication

enable :sessions  # for session variables
use Redd::Middleware,
  user_agent:   'SpaceX Mission Control (via u/theZcuber)',
  client_id:    '',
  secret:       '',
  redirect_uri: 'http://localhost:8080/auth/callback',
  scope:        ['identity', 'submit', 'edit', 'read'],
  via:          '/auth'


# OAuth and main page

get '/' do
  if request.env['redd.session']
    render_erb 'mission_control'
  else
    "<a href='/auth'>Authenticate</a>"
  end
end

get '/auth/callback' do
  redirect to '/' unless request.env['redd.error']
  "Error: #{request.env['redd.error'].message} (<a href='/'>Back</a>)"
end

get '/logout' do
  request.env['redd.session'] = nil
  redirect to '/'
end


# for updating section

get '/status' do
  render_erb 'sections/status'
end

get '/post' do
  render_erb 'sections/live_post'
end


# receive updates

post '/update' do
  session[params[:id]] = params[:value]
end
