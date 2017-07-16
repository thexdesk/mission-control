#!/usr/bin/env ruby

require 'sinatra'
require 'redd/middleware'
require './helper_functions'

set :bind, '0.0.0.0' if ARGV[0] == 'production'

enable :sessions  # for session identifier
use Redd::Middleware,
  user_agent:   'SpaceX Mission Control (via u/theZcuber)',
  client_id:    ENV['CLIENT_ID'],
  secret:       ENV['SECRET'],
  redirect_uri: 'https://spacex-mission-control.herokuapp.com/auth/callback',
  scope:        ['identity', 'submit', 'edit', 'read'],
  via:          '/auth'

# assign a session id if not set
# user's session is in `sess` variable
before do
  session[:id] ||= SecureRandom.uuid
  #$sess_var[session[:id]] ||= {}
end

# session variables
$sess_var = {}
$sess_var.default = {}


# OAuth and main page
get '/' do
  if request.env['redd.session']
    render_erb 'mission_control'
  else
    render_erb 'authenticate'
  end
end

get '/auth/callback' do
  if request.env['redd.error']
    "Error: #{request.env['redd.error'].message} (<a href='/'>Back</a>)"
  elsif not _session[:launch] or not _session[:video]
    redirect to 'init'
  else
    redirect to '/'
  end
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


# initializing variables
get '/init' do
  render_erb 'init'
end

post '/init' do
  # not doing server-side validation on this
  # if someone wants to bypass the validation, it only screws things up for them
  _session[:launch] = params[:launch]
  _session[:video] = params[:video].match(/^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=)?([\w-]{10,})/)[1]  # get video id from url
  redirect to '/'
end


# receive updates
post '/update' do
  _session[params[:id].to_sym] = params[:value]
  update_post unless ['time', 'launch', 'video'].include? params[:id]
end
