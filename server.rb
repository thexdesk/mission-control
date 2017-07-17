#!/usr/bin/env ruby

require 'sinatra'
require 'redd/middleware'
require './helper_functions'

set :bind, '0.0.0.0' if ARGV[0] == 'production'

enable :sessions # for session identifier
use Redd::Middleware,
  user_agent:   'SpaceX Mission Control (via u/theZcuber)',
  client_id:    ENV['CLIENT_ID'],
  secret:       ENV['SECRET'],
  redirect_uri: ENV['REDIRECT_URI'], # this lets us have production and tetsing
  scope:        %w[identity submit edit read],
  via:          '/auth'

# assign a session id if not set
# user's session is in `sess` variable
before do
  session[:id] ||= SecureRandom.uuid
end

# session variables
$sess_var = {}
$sess_var.default = {}

# get upcoming launches for initialization page
upcoming_launches

# OAuth and main page
get '/' do
  if request.env['redd.session']
    render_erb 'pages/mission_control'
  else
    render_erb 'pages/authenticate'
  end
end

get '/auth/callback' do
  if request.env['redd.error']
    "Error: #{request.env['redd.error'].message} (<a href='/'>Back</a>)"
  elsif !_session[:launch] || !_session[:video]
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
  render_erb 'pages/init'
end

post '/init' do
  # not doing server-side validation on this
  # if someone wants to bypass the validation, it only screws things up for them

  # if it's a launch from the API, it'll have launch time included as well
  if params[:launch].include? '|'
    nametime = params[:launch].split '|'
    _session[:launch] = nametime[0]
    _session[:time] = nametime[1].to_i * 1000 # JS wants milliseconds
  else
    _session[:launch] = params[:launch]
  end

  # get video id from url
  _session[:video] = params[:video].match(%r{^(?:https?:\/\/)?(?:www\.)?
  youtu(?:\.be|be\.com)\/(?:watch\?v=)?([\w-]{10,})}x)[1]
  redirect to '/'
end

# receive updates
post '/update' do
  _session[params[:id].to_sym] = params[:value]
  update_post unless %w[time launch video].include? params[:id]
end
